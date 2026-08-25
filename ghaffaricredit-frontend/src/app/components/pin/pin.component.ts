import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-pin',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './pin.component.html',
  styleUrl: './pin.component.scss',
})
export class PinComponent {
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);
  protected readonly currentLanguage = signal<'en' | 'ar' | 'fr'>(
    this.translationService.getLanguage() as 'en' | 'ar' | 'fr'
  );
  protected readonly pin = signal('');
  protected readonly hasError = signal(false);

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
    location.reload();
  }

  getLanguageLabel(): string {
    const language = this.currentLanguage();
    return language === 'en' ? 'EN' : language === 'ar' ? 'العربية' : 'FR';
  }

  submitPin(): void {
    if (this.pin() === '7948') {
      sessionStorage.setItem('pin-unlocked', 'true');
      this.router.navigate(['/main']);
      return;
    }

    this.hasError.set(true);
    this.pin.set('');
  }

  updatePin(value: string): void {
    this.hasError.set(false);
    this.pin.set(value.replace(/\D/g, '').slice(0, 4));
  }
}
