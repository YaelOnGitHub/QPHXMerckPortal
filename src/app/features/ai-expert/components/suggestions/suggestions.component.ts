import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss']
})
export class SuggestionsComponent implements OnInit, OnDestroy {
  constructor(private sharedService: SharedService) {}

  isFadingOut = false;
  isHidden = false;
  isProcessing = false;
  
  private sendSuggestSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to suggestion messages
    this.sendSuggestSubscription = this.sharedService.sendSuggest.subscribe(() => {
      this.SuggestFadeOut();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.sendSuggestSubscription?.unsubscribe();
  }

  SuggestFadeOut() {
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
      
      // Clear the textarea by sending an empty string
      this.sharedService.sendTextInput.next('');
      
      // Reset the processing flag after a short delay
      setTimeout(() => {
        this.isProcessing = false;
      }, 1000);
    }
  }
}
