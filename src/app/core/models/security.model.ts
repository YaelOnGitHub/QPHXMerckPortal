import { API_Response } from './common.model';

export interface CreatePINRequest {
  NewPin: any;
  ConfirmPin: any;
}

export interface SecurityPolicy {
  passwordRegularExpressions: PasswordRegex[];
  passwordRequirementText: string;
}

export interface SecurityPolicy extends API_Response {
  data: [];
}

export interface CreatePINResponse extends API_Response {
  data: [];
}

export interface SecurityQuestions {
  id: string;
  question: string;
  displayOrder: number;
}

export interface SecurityQuestions extends API_Response {
  data: [];
}

export interface PasswordRegex {
  DisplayText: string;
  Pattern: string;
}
