import { API_Response } from "src/app/core/models/common.model"

/* eslint-disable prettier/prettier */
export interface RegistrationFormModel {
    firstName: string,
    middleName: string,
    lastName: string,
    profDesignation: string,
    specialty: string,
    npiNumber: number,
    email: string,
    confirmEmail?: string,
    source: null,
    hcpIdentifier: string,
    licenses: License[],
    addresses: Address[],
    authenticationCode?: string
}

export interface License {
    licenseNumber: string,
    licenseState: string
}

export interface StateLicense {
    state: string,
    number: string,
}

export interface Address {
    address1: string,
    address2: string,
    city: string,
    state: string,
    zipCode: number,
    deaNumber: number,
    deaStatus: string,
    phoneNum: number,
    fax: number,
    addressCheckSum: string,
    addressLocId: string,
    deaNum?: string,
    addressStatus?: string,
    addressStatusMessage?: string,
    designation?: string,
    firstName?: string,
    lastName?: string,
    middleName?: string,
    hcpIdentifier?: string,
    isPreferredAddress?: string,
    licenseNumber?: string,
    licenseStatus?: string,
    npi?: string,
    locationId?:string
}
export interface HCP_Details extends API_Response {
    data: {
        hcpDetails: any
    }
}


export interface RegistrationSaveResponse extends API_Response {
    data: {
        isRegistrationPlaced: boolean
    }
}

export interface SubscriptionProducts {
    subscriptionId: string,
    productName: string,
    productLogo: string,
    productDescription: string
}


