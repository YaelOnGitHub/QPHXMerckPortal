import { API_Response } from "./common.model"


export interface AocStatusResponse extends API_Response {
    data: {
        isAocBlocker: boolean,
        totalOpenAOCs: number,
        canUserContinue: boolean
    };
}

export interface CloseAocResponse extends API_Response {
    data: {
        isAocClosed: boolean
    };
}