import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { MainLayoutComponent } from './main-layout.component';
import { CreditService } from '../../services/credit.service';
import { PersonService } from '../../services/person.service';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        {
          provide: PersonService,
          useValue: {
            getAll: () => of([]),
            search: () => of([]),
            create: () => of({}),
          },
        },
        {
          provide: CreditService,
          useValue: {
            getAll: () =>
              of([
                {
                  id: 1,
                  personId: 10,
                  personName: 'Ali Ben Ahmed',
                  amount: 2500,
                  status: 'NotPaid',
                  notes: 'Initial loan',
                  createdAt: '2026-08-18T00:00:00Z',
                },
              ]),
            create: () => of({}),
            update: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the credit form', () => {
    expect(component.showAddCreditForm()).toBeFalse();

    component.openAddCreditForm();
    expect(component.showAddCreditForm()).toBeTrue();

    component.closeAddCreditForm();
    expect(component.showAddCreditForm()).toBeFalse();
  });

  it('should open and close the edit credit form with a selected credit loaded', () => {
    component.openEditCreditForm();

    expect(component.showEditCreditForm()).toBeTrue();
    expect(component.editableCredits().length).toBe(1);
    expect(component.editCreditForm.personName).toBe('Ali Ben Ahmed');

    component.closeEditCreditForm();
    expect(component.showEditCreditForm()).toBeFalse();
  });

  it('should ignore repeated submit clicks while the request is still in flight', () => {
    const creditService = TestBed.inject(CreditService) as any;
    const createSpy = jasmine.createSpy('create').and.returnValue(new Observable(() => {}));
    creditService.create = createSpy;

    component.creditForm = {
      personId: 10,
      amount: 500,
      notes: 'Repeated click test',
    };

    component.submitCredit();
    component.submitCredit();
    component.submitCredit();

    expect(createSpy).toHaveBeenCalledTimes(1);
  });
});
