import { Component, EventEmitter, OnInit, OnDestroy, Output, PLATFORM_ID, Inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss']
})
export class TextboxComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @Output() sendMessage = new EventEmitter<string>();

  constructor(
    private sharedService: SharedService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  inputText: string = '';
  isMicEnable: boolean = false;
  recognition: any;
  finalTranscript: string = '';
  isTyping: boolean = false;

  private isTypingSubscription?: Subscription;
  private sendSuggestSubscription?: Subscription;

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!this.isTyping && this.inputText.trim()) {
        this.sendMessageAndClear();
      }
    }
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  ngOnInit(): void {
    // Subscribe to typing status
    this.isTypingSubscription = this.sharedService.isTyping$.subscribe(status => {
      this.isTyping = status;
    });

    // Subscribe to suggestion messages to clear textarea
    this.sendSuggestSubscription = this.sharedService.sendSuggest.subscribe((text) => {
      if (text) {
        // If there's text, it means a suggestion was clicked
        this.clearTextarea();
      }
    });

    // Initialize speech recognition only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.initializeSpeechRecognition();
    }
  }

  ngAfterViewInit(): void {
    // Initialize textarea after view is ready
    if (this.messageTextarea?.nativeElement) {
      this.messageTextarea.nativeElement.value = '';
      this.inputText = '';
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.isTypingSubscription?.unsubscribe();
    this.sendSuggestSubscription?.unsubscribe();
    
    // Stop speech recognition if active
    if (this.isMicEnable && this.recognition) {
      this.recognition.stop();
    }
  }

  private clearTextarea(): void {
    this.inputText = '';
    this.finalTranscript = '';
    if (this.messageTextarea?.nativeElement) {
      this.messageTextarea.nativeElement.value = '';
      this.messageTextarea.nativeElement.placeholder = 'Ask anything';
      // Force a reflow
      this.messageTextarea.nativeElement.blur();
      setTimeout(() => {
        if (this.messageTextarea?.nativeElement) {
          this.messageTextarea.nativeElement.focus();
          // Double-check clearing after focus
          this.messageTextarea.nativeElement.value = '';
          this.inputText = '';
          this.finalTranscript = '';
        }
      }, 0);
    }
  }

  private sendMessageAndClear(): void {
    // Store the current input text
    const messageToSend = this.inputText.trim();

    // Stop voice recognition if it's active
    if (this.isMicEnable) {
      this.recognition.stop();
      this.isMicEnable = false;
      // Ensure voice recognition is completely stopped
      setTimeout(() => {
        if (this.recognition) {
          this.recognition.abort();
        }
      }, 0);
    }

    // Send the message
    this.sharedService.sendTextInput.next(messageToSend);
    this.sharedService.sendSuggest.next('');
    
    // Reset all text-related properties
    this.inputText = '';
    this.finalTranscript = '';
    
    // Reset textarea and ensure placeholder is visible
    if (this.messageTextarea?.nativeElement) {
      // Force clear the textarea
      this.messageTextarea.nativeElement.value = '';
      this.messageTextarea.nativeElement.placeholder = 'Ask anything';
      
      // Force a reflow to ensure placeholder is visible
      this.messageTextarea.nativeElement.blur();
      setTimeout(() => {
        if (this.messageTextarea?.nativeElement) {
          this.messageTextarea.nativeElement.focus();
          // Double-check clearing after focus
          this.messageTextarea.nativeElement.value = '';
          this.inputText = '';
          this.finalTranscript = '';
        }
      }, 0);
    }
  }

  private initializeSpeechRecognition(): void {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        // Only process results if mic is enabled
        if (!this.isMicEnable) return;

        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            // Capitalize the first letter of each final transcript
            this.finalTranscript += this.capitalizeFirstLetter(transcript) + ' ';
          } else {
            // Capitalize the first letter of interim transcript if it's the first word
            if (!this.finalTranscript && !interimTranscript) {
              interimTranscript = this.capitalizeFirstLetter(transcript);
            } else {
              interimTranscript += transcript;
            }
          }
        }

        // Update textarea immediately with both final and interim results
        if (this.messageTextarea?.nativeElement && this.isMicEnable) {
          this.messageTextarea.nativeElement.value = this.finalTranscript + interimTranscript;
          this.inputText = this.messageTextarea.nativeElement.value;
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isMicEnable = false;
        if (this.messageTextarea?.nativeElement) {
          this.messageTextarea.nativeElement.placeholder = 'Ask anything';
        }
      };

      this.recognition.onend = () => {
        // Only restart if mic is still enabled
        if (this.isMicEnable) {
          this.recognition.start();
        }
      };
    }
  }

  toggleMic(): void {
    if (!this.recognition) {
      console.error('Speech recognition not supported');
      return;
    }

    if (this.isMicEnable) {
      this.recognition.stop();
      this.isMicEnable = false;
      // Reset placeholder and clear textarea when stopping voice recognition
      if (this.messageTextarea?.nativeElement) {
        this.messageTextarea.nativeElement.placeholder = 'Ask anything';
        this.messageTextarea.nativeElement.value = '';
        this.inputText = '';
        this.finalTranscript = '';
        // Force a reflow
        this.messageTextarea.nativeElement.blur();
        setTimeout(() => {
          if (this.messageTextarea?.nativeElement) {
            this.messageTextarea.nativeElement.focus();
            // Double-check clearing after focus
            this.messageTextarea.nativeElement.value = '';
            this.inputText = '';
            this.finalTranscript = '';
          }
        }, 0);
      }
    } else {
      this.clearTextarea();
      if (this.messageTextarea?.nativeElement) {
        this.messageTextarea.nativeElement.placeholder = 'Listening...';
      }
      this.recognition.start();
      this.isMicEnable = true;
    }
  }

  handleSend(): void {
    if (this.inputText.trim()) {
      this.sendMessageAndClear();
    }
  }
}
