import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Person } from '../models/person.model';
import{API_BASE_URL} from '../api-config';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private readonly http = inject(HttpClient);
  
  private readonly baseUrl = `${API_BASE_URL}/Person`;

  getAll(): Observable<Person[]> {
    return this.http.get<Person[]>(this.baseUrl);
  }

  getById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/${id}`);
  }

  search(name: string): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}/search?name=${encodeURIComponent(name)}`);
  }

  create(person: Person): Observable<Person> {
    return this.http.post<Person>(this.baseUrl, person);
  }

  update(id: number, person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}`, person);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
