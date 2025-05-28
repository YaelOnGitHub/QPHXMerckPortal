import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AIExpertComponent } from './ai-expert.component';

const routes: Routes = [
  {
    path: '',
    component: AIExpertComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AIExpertRoutingModule { }
