import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { authGuardsGuard } from '../guards/auth-guards.guard';
import { HomeComponent } from './home/home.component';
import { HasRoleGuardsGuard } from '../guards/has-role-guards.guard';

const routes: Routes = [
    { path: 'login', component: AuthComponent, canActivate: [authGuardsGuard] },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuardsGuard, HasRoleGuardsGuard],
        data: {
            roles: ['Admin', 'CommonUser'],
        },
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RoutingModule {}
