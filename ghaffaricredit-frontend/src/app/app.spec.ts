import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the requested sidebar sections', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('button[data-nav-item]')
    ).map((button: HTMLElement) => button.textContent?.trim());

    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Person search');
    expect(labels).toContain('Add person');
    expect(labels).toContain('Add credit');
    expect(labels).toContain('Person details');
  });
});
