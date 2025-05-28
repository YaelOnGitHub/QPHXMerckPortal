/* eslint-disable prettier/prettier */
export interface InputTextData {
    inputLocation: string,
    inputEvent?: any,
    inputTextValue?: any,
    inputTextEventType?: InputTextEventType 
}

export enum InputTextEventType {
    Focus,
    Blur
}