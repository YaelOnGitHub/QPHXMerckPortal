import { API_Response } from "./common.model"

export interface OrderSubmissionRequestParams {
    pin: number,
    password: string,
    orderType: string,
    addressId: string,
    comments: string,
    tdddId : string,
    tdddExemptReasonCd: string,
    tdddExemptReasonDescription: string,
    products: OrderSubmissionProductList[],
    deliveryDays:string,
    fax:string
}


export interface OrderSubmissionProductList {
    brandId: string,
    productId: string,
    productName: string,
    orderQuantity: number,
    productType: string
}


export interface OrderSubmissionResponse extends API_Response {
    data: {
        isOrderPlaced: boolean,
        orderNumber: string;
    };
}

export interface OrderSubmissionMultiTenantResponse extends API_Response {
    data: {
        isOrderPlaced: boolean,
        orderNumbers: any;
    };
}


export interface ProductTermsConditions extends API_Response {
    data: {
        productTermsConditions: TermsAndConsitionsProductBrand
    }
}
export interface TermsAndConsitionsProductBrand {
    fieldName: string,
    fieldValue: string
}
export interface PreferredDeliveryDay extends API_Response {
    data: {
        deliveryDate: string
    };
}

