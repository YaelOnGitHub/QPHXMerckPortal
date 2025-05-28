import { Component, OnInit,Output, EventEmitter  } from '@angular/core';
import { CartService } from '../service/cart.service';
import { EntitlementService } from 'src/app/core/services/entitlement.service';
@Component({
  selector: 'app-delivery-day',
  templateUrl: './delivery-day.component.html',
  styleUrls: ['./delivery-day.component.scss']
})
export class DeliveryDayComponent implements OnInit {
  querystring:string;
  deliveredDays=[
];
preferredDeliveryDescription:string;
@Output() deliveryDateEmitter = new EventEmitter<string>();
deliveryDate: string;

constructor(private _CartService: CartService,
  private _entitlement: EntitlementService) {}


  ngOnInit(): void {
    this.setValuesFromConfig();
    this.getAllDaysPerferredDate();
  }
  
  setValuesFromConfig(){
  let preferredDeliveryDays=this._entitlement.hasEntitlementMatchForOrderPlace('PREFFERED_DELIVERY_DAYS').split(",");
  for (let i = 0; i < preferredDeliveryDays.length; i++) 
  {
    this.deliveredDays.push({day:preferredDeliveryDays[i],isActive:false});
  }  
    
  }

  getAllDaysPerferredDate(){
    this.querystring=this.setParameterForDeliveryDate(false);
    this.getDeliveredDate(this.querystring,true);
  }
  
  onButtonClick(index:number) {
    this.deliveredDays[index].isActive=!this.deliveredDays[index].isActive;
    this.querystring=this.setParameterForDeliveryDate(true);
   if(this.querystring){
    this.getDeliveredDate(this.querystring);
   }
   else{
    this.getAllDaysPerferredDate();
   }
   
  }

  getDeliveredDate(params,isAllDays = false) {
    this._CartService.getPreferredDeliveryDate(params).subscribe((response) => {
    this.deliveryDate= response.data.deliveryDate;
    isAllDays ? this.deliveryDateEmitter.emit(null) : this.deliveryDateEmitter.emit(params);
   });
  }

  setParameterForDeliveryDate(CheckActiveDays: boolean): string {
    let days='';
    let deliveryDaysforIteration=this.deliveredDays;
    if(CheckActiveDays){
      deliveryDaysforIteration=this.deliveredDays.filter(day => day.isActive);
    }
    for (let day of deliveryDaysforIteration) 
    {
     {days += day.day + ',';}
    }
    days=days.slice(0, -1);
    return days;
  }

}
