import { API_Response } from "./common.model"

export interface HCPSearchRequest {
    npi: number,
    licenseState: string,
    licenseNumber: string,
    designation: string,
    // captchaResponse: string,
    type: number
}

export interface HCPSearchResponse extends API_Response {
    data: {
        isNewRegistrationAllowed: boolean,
        searchResults: [HCPList]
    }
}

export interface HCPList {
    firstName: string,
    middleName: string,
    lastName: string,
    profDesignation: string,
    specialty: string,
    npiNumber: number,
    email: string,
    createdBy: string,
    licenseState: string,
    licenseNumber: number,
    hcpId: number
    isTargetHcp: boolean
}