import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly navItems = [
    { label: 'Dashboard', icon: '▣', description: 'Shows recent credits' },
    { label: 'Person search', icon: '⌕', description: 'Find persons by name' },
    { label: 'Add person', icon: '+', description: 'Create new person' },
    { label: 'Add credit', icon: '✦', description: 'Create new credit' },
    { label: 'Person details', icon: '☰', description: 'View all credits for a person' },
  ];

  readonly activeItem = signal(this.navItems[0].label);

  selectItem(label: string): void {
    this.activeItem.set(label);
  }
}
