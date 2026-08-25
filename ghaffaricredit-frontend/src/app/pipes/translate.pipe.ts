import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import en from '../../assets/i18n/en.json';
import ar from '../../assets/i18n/ar.json';
import fr from '../../assets/i18n/fr.json';

@Pipe({
  name: 'translate',
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  private translations: any = { en, ar, fr };

  constructor(private translationService: TranslationService) {}

  transform(key: string): string {
    const lang = this.translationService.getLanguage();
    return this.translations[lang]?.[key] || key;
  }
}