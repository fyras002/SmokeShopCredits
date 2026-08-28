import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeepAliveService } from './services/keep-alive.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [':host { display: block; }'],
})
export class App {
  private readonly keepAliveService = inject(KeepAliveService);

  constructor() {
    this.keepAliveService.start();
  }
}

