import { Component, EventEmitter, OnInit, OnDestroy, Output, PLATFORM_ID, Inject, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-textbox',
  templateUrl: './textbox.component.html',
  styleUrls: ['./textbox.component.scss']
})
export class TextboxComponent implements OnInit, OnDestroy {
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

  ngOnInit(): void {
    // Subscribe to typing status
    this.isTypingSubscription = this.sharedService.isTyping$.subscribe(status => {
      this.isTyping = status;
    });

    // Initialize speech recognition only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.initializeSpeechRecognition();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.isTypingSubscription?.unsubscribe();
    
    // Stop speech recognition if active
    if (this.isMicEnable && this.recognition) {
      this.recognition.stop();
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
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update textarea immediately with both final and interim results
        if (this.messageTextarea?.nativeElement) {
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
      // Reset placeholder when stopping voice recognition
      if (this.messageTextarea?.nativeElement) {
        this.messageTextarea.nativeElement.placeholder = 'Ask anything';
      }
    } else {
      this.inputText = '';
      this.finalTranscript = '';
      if (this.messageTextarea?.nativeElement) {
        this.messageTextarea.nativeElement.value = '';
        this.messageTextarea.nativeElement.placeholder = 'Listening...';
      }
      this.recognition.start();
      this.isMicEnable = true;
    }
  }

  handleSend(): void {
    if (this.inputText.trim()) {
      // Stop voice recognition if it's active
      if (this.isMicEnable) {
        this.recognition.stop();
        this.isMicEnable = false;
      }

      this.sharedService.sendTextInput.next(this.inputText.trim());
      this.sharedService.sendSuggest.next('');
      this.inputText = '';
      this.finalTranscript = '';
      if (this.messageTextarea?.nativeElement) {
        this.messageTextarea.nativeElement.value = '';
        this.messageTextarea.nativeElement.placeholder = 'Ask anything';
        this.messageTextarea.nativeElement.focus();
      }
    }
  }
}
