import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuardsGuard } from '../guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { HasRoleGuardsGuard } from '../guards/has-role.guard';

const routes: Routes = [
    { path: 'login', component: AuthComponent },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuardsGuard, HasRoleGuardsGuard],
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
