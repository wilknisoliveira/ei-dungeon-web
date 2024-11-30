import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { CommonModule } from '@angular/common';
import { SmallLoadingComponent } from './small-loading/small-loading.component';
@NgModule({
    imports: [CommonModule],
    exports: [LoadingComponent, SmallLoadingComponent],
    declarations: [LoadingComponent, SmallLoadingComponent],
})
export class SharedModule {}
