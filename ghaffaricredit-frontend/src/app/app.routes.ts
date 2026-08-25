import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { PinComponent } from './components/pin/pin.component';


export const routes: Routes = [
    { path: '', component: PinComponent },
    {
        path: 'main',
        component: MainLayoutComponent,
        canActivate: [() => sessionStorage.getItem('pin-unlocked') === 'true'
            ? true
            : inject(Router).createUrlTree(['/'])],
    },
    { path: '**', redirectTo: '' },
];
