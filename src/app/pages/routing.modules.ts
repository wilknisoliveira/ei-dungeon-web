import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { authGuardsGuard } from '../guards/auth-guards.guard';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    { path: 'login', component: AuthComponent },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuardsGuard],
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RoutingModule {}
