import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from '../guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { HasRoleGuard } from '../guards/has-role.guard';
import { SignupComponent } from './signup/signup.component';
import { SettingsComponent } from './settings/settings.component';
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [
    { path: 'login', component: AuthComponent, canActivate: [AuthGuard] },
    { path: 'signup', component: SignupComponent },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard, HasRoleGuard],
        data: {
            roles: ['Admin', 'CommonUser'],
        },
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard, HasRoleGuard],
        data: {
            roles: ['Admin', 'CommonUser'],
        },
    },
    {
        path: '',
        component: LandingComponent,
        pathMatch: 'full',
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RoutingModule {}
