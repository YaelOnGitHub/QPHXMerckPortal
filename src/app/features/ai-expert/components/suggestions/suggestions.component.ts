import { Component, inject, ViewChild } from '@angular/core';
import { GreetingsComponent } from '../greetings/greetings.component';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss']
})
export class SuggestionsComponent {
  sharedService = inject(SharedService);
  isFadingOut = false;
  isHidden = false;
  isProcessing = false;

  SuggestFadeOut(){
    this.isFadingOut = true;
    setTimeout(() => {
      this.isHidden = true;
    }, 500);
  }
  
  handleSuggestionClick(text: string) {
    if (!this.isProcessing) {
      this.isProcessing = true;
      this.sharedService.sendSuggest.next(text);
      this.SuggestFadeOut();
      
      // Reset the processing flag after a short delay
      setTimeout(() => {
        this.isProcessing = false;
      }, 1000);
    }
  }
  
  constructor(){
    this.sharedService.sendSuggest.subscribe(() => {
      this.SuggestFadeOut();
    })
  }
}
