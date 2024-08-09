import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ButtonFlatComponent } from './button-flat/button-flat.component';

@NgModule({
    declarations: [
    ButtonFlatComponent
  ],
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatIconModule],
    exports: [],
})
export class SharedModule {}
