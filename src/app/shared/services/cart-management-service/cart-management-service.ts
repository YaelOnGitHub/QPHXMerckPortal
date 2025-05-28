/* eslint-disable prettier/prettier */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageType } from '../../enums/storage-type';
import { SessionService } from '../session.service';

@Injectable({
    providedIn: 'root'
})
export class cartManagementService {


    public cartStore: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    public cartStore$ = this.cartStore.asObservable();

    constructor(private _httpClient: HttpClient, private _sessionService: SessionService) {
        if (this._sessionService.get('cartStore', StorageType.Session)) {
            this.loadProductIntoCart(this._sessionService.get('cartStore', StorageType.Session))
        }
    }

    productList = [];

    loadProductIntoCart(productList) {
        this.productList = [...productList];
        this.cartStore.next(this.productList);
        this._sessionService.setItem('cartStore', this.productList, StorageType.Session);
    }

    addProductInToCart(productItem) {
        this.productList = [...this.productList, productItem];
        this.cartStore.next(this.productList);
        this._sessionService.setItem('cartStore', this.productList, StorageType.Session);
    }

    updateProductInToCart(productItem) {
        let objIndex = this.productList.findIndex((obj => obj.id == productItem.id));
        if (objIndex != -1) {
            this.productList[objIndex] = productItem;
            this.cartStore.next(this.productList);
            this._sessionService.setItem('cartStore', this.productList, StorageType.Session);
        }
    }

    updateProductQuantityInToCart(productItem) {
        let objIndex = this.productList.findIndex((obj => obj.id == productItem.id));
        let productList = this.productList.map((item, index) => {
            if (index === objIndex) {
                return {
                    ...item,
                    selectedQuantity: productItem.selectedQuantity
                };
            } else {
                return item;
            }

        });
    }

    getSelectedProductItems(): Observable<any> {
        return this.cartStore$;
    }

    deleteSelectedProductItems(productItemForDelete) {
        this.removeProductFromProductList(this.productList, 'id', productItemForDelete.id);
        this.cartStore.next(this.productList);
        this._sessionService.setItem('cartStore', this.productList, StorageType.Session);
    }

    getSrfProductCount(srfId) {
        return this.productList.filter(x=>x.srfId == srfId).length
    }

    removeProductFromProductList(arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length > 2 && arr[i][attr] === value)) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }


    clearProductStore() {
        this.productList = [];
        this.cartStore.next([]);
        this._sessionService.setItem('cartStore', [], StorageType.Session);
        this._sessionService.removeItem('SRFAddressId')
    }

    getCartItemCount(): any {
        return this.productList?.length
    }

    getSelectedItemQuantity(items) {
      let sumOfSelectedQuantity = 0
      for (const item of items) {
        sumOfSelectedQuantity += parseInt(item.selectedQuantity);
      }
      return sumOfSelectedQuantity
    }
    
    getCurretnProductValue() {
        return this.cartStore.value
    }

}
