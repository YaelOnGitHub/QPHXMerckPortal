import { Component, inject, AfterViewChecked, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements AfterViewChecked, OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  sharedService = inject(SharedService);
  isHidden = true;
  isFadeIn = false;
  messages: { text: string, isSuggestion: boolean }[] = [];

  // Property to hold the current username from the Observable
  userName: string = 'Guest';
  // Property to hold the subscription to the userName$ Observable
  private userNameSubscription: Subscription | undefined;
  // Properties to hold subscriptions from the Subjects
  private sendSuggestSubscription: Subscription | undefined;
  private sendTextInputSubscription: Subscription | undefined;

  // Use OnInit to subscribe to Observables
  ngOnInit(): void {
      this.userNameSubscription = this.sharedService.userName$.subscribe(name => {
          this.userName = name; // Update component property when username changes
      });

      // Keep the subscriptions from the constructor, but assign them to properties
      this.sendSuggestSubscription = this.sharedService.sendSuggest.subscribe((text: string) => {
          if (text) {
              this.messages.push({ text, isSuggestion: true });
              this.showChatbox();
              // Call the method to update the BehaviorSubject in the service
              this.sharedService.setIsTyping(true);

              // Show typing indicator for 2 seconds
              setTimeout(() => {
                  this.sharedService.setIsTyping(false);
              }, 2000);
          }
      });

      this.sendTextInputSubscription = this.sharedService.sendTextInput.subscribe((text: string) => {
          if (text) {
              this.messages.push({ text, isSuggestion: false });
              this.showChatbox();
               // Call the method to update the BehaviorSubject in the service
              this.sharedService.setIsTyping(true);

              // Show typing indicator for 2 seconds
              setTimeout(() => {
                   this.sharedService.setIsTyping(false);
              }, 2000);
          }
      });
  }

  // Use OnDestroy to unsubscribe from Observables
  ngOnDestroy(): void {
      this.userNameSubscription?.unsubscribe();
      this.sendSuggestSubscription?.unsubscribe();
      this.sendTextInputSubscription?.unsubscribe();
  }

  getInitials(): string {
    // Use the component's userName property
    const name = this.userName;
    if (name === 'Guest') return 'GU';
    
    const words = name.split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  showChatbox(){
    this.isFadeIn = true;
    setTimeout(() => {
      this.isHidden = false;
    }, 500)
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const element = this.scrollContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch (err) { }
  }

  constructor(){}
}