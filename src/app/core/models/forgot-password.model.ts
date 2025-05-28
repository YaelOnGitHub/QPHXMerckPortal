import { API_Response } from "./common.model"

export interface forgotPasswordRequest {
    email: string
}


export interface forgotPasswordResponse extends API_Response {
    data: null
}