import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, signal, inject, effect, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Credit } from '../../models/credit.model';
import { Person } from '../../models/person.model';
import { CreditService } from '../../services/credit.service';
import { PersonService } from '../../services/person.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly personService = inject(PersonService);
  private readonly creditService = inject(CreditService);
  private readonly translationService = inject(TranslationService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly title = signal('Ghaffari Credit');
  protected readonly currentLanguage = signal<'en' | 'ar' | 'fr'>('en');
  protected readonly showAddPersonForm = signal(false);
  protected readonly showAddCreditForm = signal(false);
  protected readonly showEditCreditForm = signal(false);
  protected readonly showSearchPersonForm = signal(false);
  protected readonly showAllCredits = signal(false);
  protected readonly persons = signal<Person[]>([]);
  protected readonly recentCredits = signal<Credit[]>([]);
  protected readonly editableCredits = signal<Credit[]>([]);
  protected readonly activeCreditsCount = signal(0);
  protected readonly paidLoansCount = signal(0);
  protected readonly totalCreditsAmount = signal(0);

  personForm: Person = {
    name: '',
    phone: '',
    address: '',
    notes: '',
  };

  creditForm: Credit = {
    personId: 0,
    amount: 0,
    notes: '',
  };

  editCreditForm: Credit = {
    id: 0,
    personId: 0,
    personName: '',
    amount: 0,
    notes: '',
  };

  editAmountToAdd = 0;
  editAmountToRemove = 0;

  selectedCreditId: number | null = null;
  searchTerm = '';
  searchResults: Person[] = [];
  selectedPerson: Person | null = null;

  ngOnInit(): void {
    // Sync the component's language signal with the service's current language
    this.currentLanguage.set(this.translationService.getLanguage() as 'en' | 'ar' | 'fr');
    
    // Listen for language changes
    this.translationService.currentLanguage$.subscribe(lang => {
      this.currentLanguage.set(lang as 'en' | 'ar' | 'fr');
    });

    this.loadPersons();
    this.loadRecentCredits();
  }

  loadPersons(): void {
    this.personService.getAll().subscribe({
      next: (persons) => {
        const sortedPersons = [...persons].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );

        this.persons.set(sortedPersons);
        if (sortedPersons.length > 0 && this.creditForm.personId === 0) {
          this.creditForm.personId = sortedPersons[0].id ?? 0;
        }
      },
      error: (error) => {
        console.error('Failed to load persons:', error);
      },
    });
  }

  loadRecentCredits(): void {
    this.creditService.getAll().subscribe({
      next: (credits) => {
        const sortedCredits = [...credits].sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );

        this.recentCredits.set(this.showAllCredits() ? sortedCredits : sortedCredits.slice(0, 3));
        this.activeCreditsCount.set(
          credits.filter((credit) => !this.isCreditPaid(credit.status, credit.amount)).length
        );
        this.paidLoansCount.set(
          credits.filter((credit) => this.isCreditPaid(credit.status, credit.amount)).length
        );
        this.totalCreditsAmount.set(
          credits.reduce((sum, credit) => sum + Number(credit.amount || 0), 0)
        );
      },
      error: (error) => {
        console.error('Failed to load recent credits:', error);
      },
    });
  }

  toggleAllCredits(): void {
    this.showAllCredits.set(!this.showAllCredits());
    this.loadRecentCredits();
    this.cdr.markForCheck();
  }

  getStatusLabel(status?: string | number | null, amount?: number): string {
    const isPaid = this.isCreditPaid(status, amount);
    const key = isPaid ? 'paid' : 'notPaid';
    
    // Get the translation from JSON based on current language
    const currentLang = this.translationService.getLanguage();
    const translations: any = {
      en: { paid: 'Paid', notPaid: 'Not paid' },
      ar: { paid: 'مسدد', notPaid: 'لم يتم السداد' },
      fr: { paid: 'Remboursé', notPaid: 'Non remboursé' }
    };
    
    return translations[currentLang as keyof typeof translations]?.[key] || (isPaid ? 'Paid' : 'Not paid');
  }

  private isCreditPaid(status?: string | number | null, amount?: number): boolean {
    if (amount !== undefined) {
      return Number(amount) === 0;
    }

    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;
    return normalizedStatus === 'paid' || normalizedStatus === 1 || normalizedStatus === '1';
  }

  getStatusClass(status?: string | number | null, amount?: number): string {
    const currentLang = this.translationService.getLanguage();
    const paidLabel = currentLang === 'ar' ? 'مسدد' : (currentLang === 'fr' ? 'Remboursé' : 'Paid');
    return this.getStatusLabel(status, amount) === paidLabel ? 'status-paid' : 'status-unpaid';
  }

  getDeleteConfirmation(creditName: string): string {
    const currentLang = this.translationService.getLanguage();
    const messages = {
      en: `Delete the credit for ${creditName}?`,
      ar: `هل تريد حذف ائتمان ${creditName}؟`,
      fr: `Supprimer le crédit de ${creditName} ?`,
    };
    return messages[currentLang as keyof typeof messages] || messages.en;
  }

  getRelativeDateLabel(dateValue?: string): string {
    if (!dateValue) {
      const currentLang = this.translationService.getLanguage();
      const recently: any = {
        en: 'Recently',
        ar: 'مؤخراً',
        fr: 'Récemment'
      };
      return recently[currentLang as keyof typeof recently] || 'Recently';
    }

    const createdAt = new Date(dateValue);
    const diffMs = Date.now() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const currentLang = this.translationService.getLanguage();
    const labels: any = {
      en: { today: 'Today', dayAgo: '1 day ago', daysAgo: 'days ago', weekAgo: '1 week ago', weeksAgo: 'weeks ago' },
      ar: { today: 'اليوم', dayAgo: 'منذ يوم واحد', daysAgo: 'أيام مضت', weekAgo: 'منذ أسبوع واحد', weeksAgo: 'أسابيع مضت' },
      fr: { today: 'Aujourd\'hui', dayAgo: 'Il y a 1 jour', daysAgo: 'jours', weekAgo: 'Il y a 1 semaine', weeksAgo: 'semaines' }
    };
    const langLabels = labels[currentLang as keyof typeof labels] || labels['en'];

    if (diffDays <= 0) {
      return langLabels.today;
    }

    if (diffDays === 1) {
      return langLabels.dayAgo;
    }

    if (diffDays < 7) {
      return `${diffDays} ${langLabels.daysAgo}`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) {
      return langLabels.weekAgo;
    }

    return `${diffWeeks} ${langLabels.weeksAgo}`;
  }

  openAddPersonForm(): void {
    this.showAddPersonForm.set(true);
    this.cdr.markForCheck();
  }

  closeAddPersonForm(): void {
    this.showAddPersonForm.set(false);
    this.personForm = {
      name: '',
      phone: '',
      address: '',
      notes: '',
    };
    this.cdr.markForCheck();
  }

  openAddCreditForm(): void {
    this.loadPersons();
    this.showAddCreditForm.set(true);
    this.cdr.markForCheck();
  }

  closeAddCreditForm(): void {
    this.showAddCreditForm.set(false);
    this.creditForm = {
      personId: 0,
      amount: 0,
      notes: '',
    };
    this.cdr.markForCheck();
  }

  openEditCreditForm(): void {
    this.loadPersons();
    this.creditService.getAll().subscribe({
      next: (credits) => {
        const sortedCredits = [...credits].sort((a, b) =>
          (a.personName ?? '').localeCompare(b.personName ?? '', undefined, { sensitivity: 'base' })
        );
        this.editableCredits.set(sortedCredits);

        const firstCredit = sortedCredits[0];
        if (firstCredit) {
          this.selectedCreditId = firstCredit.id ?? null;
          this.populateEditForm(firstCredit);
        } else {
          this.selectedCreditId = null;
          this.editCreditForm = {
            id: 0,
            personId: 0,
            personName: '',
            amount: 0,
            notes: '',
          };
        }

        this.showEditCreditForm.set(true);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load credits for edit:', error);
        this.cdr.markForCheck();
      },
    });
  }

  closeEditCreditForm(): void {
    this.showEditCreditForm.set(false);
    this.selectedCreditId = null;
    this.editableCredits.set([]);
    this.editCreditForm = {
      id: 0,
      personId: 0,
      personName: '',
      amount: 0,
      notes: '',
    };
    this.editAmountToAdd = 0;
    this.editAmountToRemove = 0;
    this.cdr.markForCheck();
  }

  populateEditForm(credit: Credit): void {
    this.selectedCreditId = credit.id ?? null;
    this.editCreditForm = {
      id: credit.id,
      personId: credit.personId,
      personName: credit.personName ?? '',
      amount: Number(credit.amount || 0),
      notes: credit.notes ?? '',
    };
    this.editAmountToAdd = 0;
    this.editAmountToRemove = 0;
  }

  selectCreditToEdit(credit: Credit): void {
    this.populateEditForm(credit);
    this.cdr.markForCheck();
  }

  getUpdatedEditAmount(): number {
    return Math.max(
      0,
      Number(this.editCreditForm.amount || 0) +
        Number(this.editAmountToAdd || 0) -
        Number(this.editAmountToRemove || 0)
    );
  }

  submitEditCredit(): void {
    if (!this.selectedCreditId) {
      console.error('No credit selected for edit.');
      return;
    }

    const payload = {
      amount: this.getUpdatedEditAmount(),
      notes: this.editCreditForm.notes,
    };

    this.creditService.update(this.selectedCreditId, payload).subscribe({
      next: () => {
        console.log('Credit updated successfully');
        this.closeEditCreditForm();
        this.loadRecentCredits();
        this.loadPersons();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to update credit:', error);
        this.cdr.markForCheck();
      },
    });
  }

  deleteSelectedCredit(): void {
    if (this.selectedCreditId === null) {
      console.error('No credit selected for deletion.');
      return;
    }

    const creditName = this.editCreditForm.personName || 'Unknown person';
    if (!window.confirm(this.getDeleteConfirmation(creditName))) {
      return;
    }

    this.creditService.delete(this.selectedCreditId).subscribe({
      next: () => {
        const remainingCredits = this.editableCredits().filter(
          (credit) => credit.id !== this.selectedCreditId
        );
        this.editableCredits.set(remainingCredits);
        this.loadRecentCredits();

        if (remainingCredits.length === 0) {
          this.closeEditCreditForm();
          this.cdr.markForCheck();
          return;
        }

        this.populateEditForm(remainingCredits[0]);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to delete credit:', error);
        this.cdr.markForCheck();
      },
    });
  }

  printCreditNote(): void {
    const credit = this.editableCredits().find((item) => item.id === this.selectedCreditId);
    if (!credit) {
      console.error('No credit selected for printing.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) {
      console.error('Unable to open print window. Please allow pop-ups for this app.');
      return;
    }

    const language = this.translationService.getLanguage();
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    const labels = {
      title: this.getPrintLabel('Credit note', language),
      person: this.getPrintLabel('Person', language),
      amount: this.getPrintLabel('Amount', language),
      status: this.getPrintLabel('Status', language),
      date: this.getPrintLabel('Date', language),
      notes: this.getPrintLabel('Notes', language),
    };
    const personName = credit.personName || this.getPrintLabel('Unknown person', language);
    const notes = credit.notes || '-';

    printWindow.document.write(`<!doctype html><html lang="${language}" dir="${direction}">
      <head><meta charset="utf-8"><title>${labels.title}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #17231f; margin: 3rem auto; max-width: 680px; }
        h1 { border-bottom: 2px solid #047857; padding-bottom: 1rem; }
        dl { margin: 2rem 0; }
        dt { color: #527066; font-size: 0.85rem; margin-top: 1rem; }
        dd { border-bottom: 1px solid #d5e1dc; font-size: 1.1rem; margin: 0.35rem 0 0; padding-bottom: 0.75rem; }
        @media print { body { margin: 1rem; } }
      </style></head>
      <body><h1>${labels.title}</h1><dl>
        <dt>${labels.person}</dt><dd>${this.escapePrintHtml(personName)}</dd>
        <dt>${labels.amount}</dt><dd>${this.escapePrintHtml(String(Number(credit.amount || 0)))} DT</dd>
        <dt>${labels.status}</dt><dd>${this.escapePrintHtml(this.getStatusLabel(credit.status, credit.amount))}</dd>
        <dt>${labels.date}</dt><dd>${this.escapePrintHtml(this.formatPrintDate(credit.createdAt, language))}</dd>
        <dt>${labels.notes}</dt><dd>${this.escapePrintHtml(notes)}</dd>
      </dl></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  printAllCredits(): void {
    this.creditService.getAll().subscribe({
      next: (credits) => {
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) {
          console.error('Unable to open print window. Please allow pop-ups for this app.');
          return;
        }

        const sortedCredits = [...credits].sort((a, b) =>
          (a.personName ?? '').localeCompare(b.personName ?? '', undefined, { sensitivity: 'base' })
        );
        const language = this.translationService.getLanguage();
        const direction = language === 'ar' ? 'rtl' : 'ltr';
        const labels = {
          title: this.getPrintLabel('All credits', language),
          person: this.getPrintLabel('Person', language),
          amount: this.getPrintLabel('Amount', language),
          status: this.getPrintLabel('Status', language),
          date: this.getPrintLabel('Date', language),
          notes: this.getPrintLabel('Notes', language),
          total: this.getPrintLabel('Total', language),
          noCredits: this.getPrintLabel('No credits found.', language),
        };
        const totalAmount = credits.reduce((sum, credit) => sum + Number(credit.amount || 0), 0);
        const rows = sortedCredits.length
          ? sortedCredits
              .map(
                (credit) => `<tr>
                  <td>${this.escapePrintHtml(credit.personName || this.getPrintLabel('Unknown person', language))}</td>
                  <td>${this.escapePrintHtml(String(Number(credit.amount || 0)))} DT</td>
                  <td>${this.escapePrintHtml(this.getStatusLabel(credit.status, credit.amount))}</td>
                  <td>${this.escapePrintHtml(this.formatPrintDate(credit.createdAt, language))}</td>
                  <td>${this.escapePrintHtml(credit.notes || '')}</td>
                </tr>`
              )
              .join('')
          : `<tr><td colspan="5">${labels.noCredits}</td></tr>`;

        printWindow.document.write(`<!doctype html><html lang="${language}" dir="${direction}">
          <head><meta charset="utf-8"><title>${labels.title}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #17231f; margin: 2rem; }
            h1 { margin-bottom: 1.5rem; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #b7c8c1; padding: 0.65rem; text-align: start; }
            th { background: #e8f4ef; }
            tfoot td { font-weight: 700; background: #f5faf8; }
            @media print { body { margin: 0; } }
          </style></head>
          <body><h1>${labels.title}</h1><table>
            <thead><tr><th>${labels.person}</th><th>${labels.amount}</th><th>${labels.status}</th><th>${labels.date}</th><th>${labels.notes}</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td>${labels.total}</td><td>${totalAmount} DT</td><td colspan="3"></td></tr></tfoot>
          </table></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      },
      error: (error) => {
        console.error('Failed to load credits for printing:', error);
      },
    });
  }

  private getPrintLabel(key: string, language: string): string {
    const labels: Record<string, Record<string, string>> = {
      en: {
        'Credit note': 'Credit note',
        'All credits': 'All credits',
        Person: 'Person',
        Amount: 'Amount',
        Status: 'Status',
        Date: 'Date',
        Notes: 'Notes',
        Total: 'Total',
        'No credits found.': 'No credits found.',
        'Unknown person': 'Unknown person',
      },
      fr: {
        'Credit note': 'Note de crédit',
        'All credits': 'Tous les crédits',
        Person: 'Personne',
        Amount: 'Montant',
        Status: 'Statut',
        Date: 'Date',
        Notes: 'Notes',
        Total: 'Total',
        'No credits found.': 'Aucun crédit trouvé.',
        'Unknown person': 'Personne inconnue',
      },
      ar: {
        'Credit note': 'مذكرة ائتمان',
        'All credits': 'جميع الائتمانات',
        Person: 'الشخص',
        Amount: 'المبلغ',
        Status: 'الحالة',
        Date: 'التاريخ',
        Notes: 'ملاحظات',
        Total: 'المجموع',
        'No credits found.': 'لم يتم العثور على ائتمانات.',
        'Unknown person': 'شخص غير معروف',
      },
    };

    return labels[language]?.[key] ?? labels['en'][key] ?? key;
  }

  private formatPrintDate(dateValue: string | undefined, language: string): string {
    if (!dateValue) {
      return '';
    }

    return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(dateValue));
  }

  private escapePrintHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[character];
    });
  }

  openSearchPersonForm(): void {
    this.showSearchPersonForm.set(true);
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedPerson = null;
    this.cdr.markForCheck();
  }

  closeSearchPersonForm(): void {
    this.showSearchPersonForm.set(false);
    this.searchTerm = '';
    this.searchResults = [];
    this.selectedPerson = null;
    this.cdr.markForCheck();
  }

  toggleLanguage(): void {
    const languages: ('en' | 'ar' | 'fr')[] = ['en', 'ar', 'fr'];
    const currentIndex = languages.indexOf(this.currentLanguage());
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    this.currentLanguage.set(nextLang);
    this.translationService.setLanguage(nextLang);
    location.reload();
  }

  getLanguageLabel(): string {
    const lang = this.currentLanguage();
    return lang === 'en' ? 'EN' : lang === 'ar' ? 'العربية' : 'FR';
  }

  searchPerson(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      this.searchResults = [];
      this.selectedPerson = null;
      this.cdr.markForCheck();
      return;
    }

    this.personService.search(term).subscribe({
      next: (persons) => {
        this.searchResults = persons;
        this.selectedPerson = persons[0] ?? null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to search persons:', error);
        this.searchResults = [];
        this.selectedPerson = null;
        this.cdr.markForCheck();
      },
    });
  }

  selectPerson(person: Person): void {
    this.selectedPerson = person;
    this.cdr.markForCheck();
  }

  submitPerson(): void {
    const payload: Person = {
      name: this.personForm.name,
      phone: this.personForm.phone,
      address: this.personForm.address,
      notes: this.personForm.notes,
    };

    this.personService.create(payload).subscribe({
      next: () => {
        console.log('Person created successfully');
        this.closeAddPersonForm();
        this.loadPersons();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to create person:', error);
        this.cdr.markForCheck();
      },
    });
  }

  submitCredit(): void {
    const payload: Credit = {
      personId: this.creditForm.personId,
      amount: Number(this.creditForm.amount),
      notes: this.creditForm.notes,
    };

    this.creditService.create(payload).subscribe({
      next: () => {
        console.log('Credit created successfully');
        this.closeAddCreditForm();
        this.loadRecentCredits();
        this.loadPersons();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to create credit:', error);
        this.cdr.markForCheck();
      },
    });
  }

  deleteSelectedPerson(): void {
    if (!this.selectedPerson || !this.selectedPerson.id) {
      console.error('No person selected for deletion.');
      return;
    }

    const personName = this.selectedPerson.name || 'Unknown person';
    if (!window.confirm(`Are you sure you want to delete ${personName}? This action cannot be undone.`)) {
      return;
    }

    this.personService.delete(this.selectedPerson.id).subscribe({
      next: () => {
        console.log('Person deleted successfully');
        this.closeSearchPersonForm();
        this.loadPersons();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to delete person:', error);
        this.cdr.markForCheck();
      },
    });
  }
}

