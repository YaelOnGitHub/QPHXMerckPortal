import { Component, AfterViewChecked, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
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
  
  private shouldScroll: boolean = true;
  private lastScrollHeight: number = 0;
  private lastScrollTop: number = 0;
  private isUserScrolling: boolean = false;
  private scrollTimeout: any;
  private scrollThrottleTimeout: any;
  private isScrolling: boolean = false;
  private forceScrollNext: boolean = false;
  
  constructor(
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}
  
  isHidden = true;
  isFadeIn = false;
  messages: { text: string, isSuggestion: boolean }[] = [];
  userName: string = 'Guest';
  isTyping: boolean = false;

  // Subscriptions
  private userNameSubscription?: Subscription;
  private isTypingSubscription?: Subscription;
  private sendSuggestSubscription?: Subscription;
  private sendTextInputSubscription?: Subscription;

  ngOnInit(): void {
    // Subscribe to username changes
    this.userNameSubscription = this.sharedService.userName$.subscribe(name => {
      this.userName = name;
    });

    // Subscribe to typing status
    this.isTypingSubscription = this.sharedService.isTyping$.subscribe(status => {
      this.isTyping = status;
    });

    // Subscribe to suggestion messages
    this.sendSuggestSubscription = this.sharedService.sendSuggest.subscribe((text: string) => {
      if (text) {
        this.messages.push({ text, isSuggestion: true });
        this.showChatbox();
        this.sharedService.setIsTyping(true);
        this.forceScrollNext = true; // Force scroll for new suggestions
        this.forceScrollToBottom();
        
        setTimeout(() => {
          this.sharedService.setIsTyping(false);
          this.forceScrollNext = true; // Force scroll when typing indicator disappears
          this.forceScrollToBottom();
          this.cdr.detectChanges();
        }, 2000);
      }
    });

    // Subscribe to text input messages
    this.sendTextInputSubscription = this.sharedService.sendTextInput.subscribe((text: string) => {
      if (text) {
        this.messages.push({ text, isSuggestion: false });
        this.showChatbox();
        this.sharedService.setIsTyping(true);
        this.forceScrollNext = true; // Force scroll for new messages
        this.forceScrollToBottom();
        
        setTimeout(() => {
          this.sharedService.setIsTyping(false);
          this.forceScrollNext = true; // Force scroll when typing indicator disappears
          this.forceScrollToBottom();
          this.cdr.detectChanges();
        }, 2000);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.userNameSubscription?.unsubscribe();
    this.isTypingSubscription?.unsubscribe();
    this.sendSuggestSubscription?.unsubscribe();
    this.sendTextInputSubscription?.unsubscribe();
    
    // Clear any pending timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.scrollThrottleTimeout) {
      clearTimeout(this.scrollThrottleTimeout);
    }
  }

  getInitials(): string {
    if (this.userName === 'Guest') return 'GU';
    
    const words = this.userName.split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  showChatbox() {
    this.isFadeIn = true;
    setTimeout(() => {
      this.isHidden = false;
    }, 500);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && !this.isUserScrolling) {
      this.scrollToBottom();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    // Only prevent auto-scroll if we're not forcing a scroll
    if (!this.forceScrollNext) {
      this.isUserScrolling = true;
      this.shouldScroll = false;
    }
    
    // Clear any pending scroll timeouts
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  private forceScrollToBottom(): void {
    this.ngZone.runOutsideAngular(() => {
      // Clear any existing timeout
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      // Set a small delay to ensure DOM is updated
      this.scrollTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          if (this.forceScrollNext) {
            this.shouldScroll = true;
            this.isUserScrolling = false;
            this.scrollToBottom(true);
            this.forceScrollNext = false;
          } else if (!this.isUserScrolling) {
            this.shouldScroll = true;
            this.scrollToBottom(false);
          }
        });
      }, 100);
    });
  }

  private shouldAutoScroll(): boolean {
    // Always scroll if we're forcing it
    if (this.forceScrollNext) {
      return true;
    }

    if (this.isUserScrolling || this.isScrolling) {
      return false;
    }

    const element = this.scrollContainer.nativeElement;
    const currentScrollHeight = element.scrollHeight;
    const currentScrollTop = element.scrollTop;
    const clientHeight = element.clientHeight;
    
    // If user has scrolled up more than 150px from bottom, don't auto-scroll
    if (currentScrollHeight - (currentScrollTop + clientHeight) > 150) {
      return false;
    }
    
    // If content height has changed, we should scroll
    if (currentScrollHeight !== this.lastScrollHeight) {
      this.lastScrollHeight = currentScrollHeight;
      return true;
    }
    
    return false;
  }

  scrollToBottom(force: boolean = false): void {
    if (this.isScrolling && !force) return;

    try {
      const element = this.scrollContainer.nativeElement;
      
      // Only scroll if we should or if forcing
      if (this.shouldAutoScroll() || force) {
        this.isScrolling = true;
        
        // Use smooth scrolling only if not forcing
        element.scrollTo({
          top: element.scrollHeight,
          behavior: force ? 'auto' : 'smooth'
        });
        
        this.lastScrollTop = element.scrollTop;
        
        // Reset scrolling state after animation
        setTimeout(() => {
          this.isScrolling = false;
          this.shouldScroll = false;
          this.forceScrollNext = false;
        }, force ? 0 : 300);
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
      this.isScrolling = false;
      this.forceScrollNext = false;
    }
  }

  onScroll(): void {
    // Throttle scroll events to improve performance
    if (this.scrollThrottleTimeout) {
      return;
    }

    this.scrollThrottleTimeout = setTimeout(() => {
      const element = this.scrollContainer.nativeElement;
      const currentScrollTop = element.scrollTop;
      const currentScrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      
      // If user manually scrolls up and we're not forcing a scroll
      if (currentScrollTop < this.lastScrollTop && !this.forceScrollNext) {
        this.isUserScrolling = true;
        this.shouldScroll = false;
      }
      
      // If user scrolls to bottom, re-enable auto-scroll
      if (currentScrollHeight - (currentScrollTop + clientHeight) < 50) {
        this.isUserScrolling = false;
        this.shouldScroll = true;
      }
      
      this.lastScrollTop = currentScrollTop;
      this.scrollThrottleTimeout = null;
    }, 50); // Throttle to 50ms
  }
}