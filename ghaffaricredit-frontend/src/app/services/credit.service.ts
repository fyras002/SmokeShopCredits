import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Credit } from '../models/credit.model';
import { API_BASE_URL } from '../api-config';
@Injectable({
  providedIn: 'root',
})
export class CreditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/Credit`;

  getAll(): Observable<Credit[]> {
    return this.http.get<Credit[]>(this.baseUrl);
  }

  getById(id: number): Observable<Credit> {
    return this.http.get<Credit>(`${this.baseUrl}/${id}`);
  }

  getByPersonId(personId: number): Observable<Credit[]> {
    return this.http.get<Credit[]>(`${this.baseUrl}/person/${personId}`);
  }

  create(credit: Credit): Observable<Credit> {
    return this.http.post<Credit>(this.baseUrl, credit);
  }

  update(id: number, credit: Partial<Credit>): Observable<Credit> {
    return this.http.put<Credit>(`${this.baseUrl}/${id}`, credit);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
