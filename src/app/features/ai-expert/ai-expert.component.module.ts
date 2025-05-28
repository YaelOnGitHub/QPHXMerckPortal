import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AIExpertRoutingModule } from './ai-expert-routing.module';
import { AIExpertComponent } from './ai-expert.component';
import { ChatboxComponent } from './components/chatbox/chatbox.component';
import { GreetingsComponent } from './components/greetings/greetings.component';
import { SuggestionsComponent } from './components/suggestions/suggestions.component';
import { TextboxComponent } from './components/textbox/textbox.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    AIExpertComponent, ChatboxComponent, GreetingsComponent, SuggestionsComponent, TextboxComponent
  ],
  imports: [
    CommonModule,
    AIExpertRoutingModule,
    SharedModule,
    PaginationModule.forRoot()

  ],
//   providers: [AIExpertService]
})
export class AIExpertComponentModule { }
