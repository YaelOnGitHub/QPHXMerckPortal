import { Component, EventEmitter, Input, OnInit, Output,  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CartService } from 'src/app/features/shopping-cart/service/cart.service';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent implements OnInit {

  @Input() icon?: string = null;
  @Input() label!: string;
  @Input() control!: FormControl;
  @Input() disableBtn: boolean = false;
  @Output() changeSelection = new EventEmitter<any>()

  constructor(private _cartService: CartService) { }

  ngOnInit(): void {
  }

  onChangeValue(event: any) {
    this.changeSelection.emit(event)
    this._cartService.tdddExempt.next(event)
  }

}
