import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { API_BASE_URL } from '../api-config';

const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class KeepAliveService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  start(): void {
    timer(0, KEEP_ALIVE_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.http.get(`${API_BASE_URL}/Health`).pipe(catchError(() => EMPTY))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
