// src/app/features/ai-expert/components/greetings/greetings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-greetings',
  templateUrl: './greetings.component.html',
  styleUrls: ['./greetings.component.scss']
})
export class GreetingsComponent implements OnInit, OnDestroy {
  constructor(private sharedService: SharedService) {}

  isFadingOut = false;
  isHidden = false;
  userName: string = 'Guest';
  
  private userNameSubscription?: Subscription;
  private sendSuggestSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to username changes
    this.userNameSubscription = this.sharedService.userName$.subscribe(name => {
      this.userName = name;
    });

    // Subscribe to suggestion messages
    this.sendSuggestSubscription = this.sharedService.sendSuggest.subscribe(() => {
      this.GreetFadeOut();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.userNameSubscription?.unsubscribe();
    this.sendSuggestSubscription?.unsubscribe();
  }

  GreetFadeOut() {
    this.isFadingOut = true;
    setTimeout(() => {
      this.isHidden = true;
    }, 500);
  }
}