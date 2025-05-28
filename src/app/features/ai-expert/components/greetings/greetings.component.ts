// src/app/features/ai-expert/components/greetings/greetings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-greetings',
  templateUrl: './greetings.component.html',
  styleUrls: ['./greetings.component.scss']
})
export class GreetingsComponent implements OnInit, OnDestroy { // Implement OnInit and OnDestroy

  userName: string = 'Guest'; // Property to hold the current username
  private userNameSubscription: Subscription; // To store the subscription

  constructor(private sharedService: SharedService){} // Keep the service injection

  ngOnInit(): void {
    // Subscribe to the userName$ observable
    this.userNameSubscription = this.sharedService.userName$.subscribe(name => {
      this.userName = name; // Update the component's property when the value changes
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe when the component is destroyed to prevent memory leaks
    if (this.userNameSubscription) {
      this.userNameSubscription.unsubscribe();
    }
  }

  isFadingOut = false;
  isHidden = false;

  GreetFadeOut(){
    this.isFadingOut = true;
    setTimeout(() => {
      this.isHidden = true;
    }, 500);
  }
}