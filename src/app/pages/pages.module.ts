import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutingModule } from './routing.modules';
import { AuthComponent } from './auth/auth.component';

@NgModule({
    declarations: [AuthComponent],
    imports: [CommonModule, RoutingModule],
})
export class PagesModule {}
