export interface API_Response {
    success: boolean,
    data: {},
    errors: null,
    lookupCode: null,
    message: null,
    statusCode: number,
}


export interface Designation extends API_Response {
    data: { profileDesignations: [Designations] }
}

export interface Designations {
    description: string,
    abbreviation: string,
}


export interface StatesResponse extends API_Response {
    data: { states: [States] }
}

export interface States {
    countryCode: string,
    stateName: string,
    stateCode: string
}

export interface CancelSubscriptionRequest {
    subscriptionId: string
}

