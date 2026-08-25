import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly languages = ['en', 'ar', 'fr'];
  private languageSubject = new BehaviorSubject<string>(this.getLanguage());
  
  currentLanguage$ = this.languageSubject.asObservable();

  getLanguage(): string {
    return localStorage.getItem('lang') || 'en';
  }

  setLanguage(lang: string): void {
    if (this.languages.includes(lang)) {
      localStorage.setItem('lang', lang);
      this.languageSubject.next(lang);
    }
  }

  toggleLanguage(): void {
    const current = this.getLanguage();
    const currentIndex = this.languages.indexOf(current);
    const nextIndex = (currentIndex + 1) % this.languages.length;
    this.setLanguage(this.languages[nextIndex]);
  }

  getLang(): string {
    return this.getLanguage();
  }
}
