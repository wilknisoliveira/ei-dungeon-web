import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { CommonModule } from '@angular/common';
@NgModule({
    imports: [CommonModule],
    exports: [LoadingComponent],
    declarations: [LoadingComponent],
})
export class SharedModule {}
