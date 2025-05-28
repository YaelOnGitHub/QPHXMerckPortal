export interface CloseAocRequest {
    Pin: number;
    Password: string;
    StateLicenseNumber: string;
    StateLicense: string;
    LastName: string;
    FirstName: string;
    MiddleName?: string;
    Address1: string;
    Address2?: string;
    City: string;
    State: string;
    Zip: string;
    Speciality?: string;
    ProfDesig?: string;
    XtrnlPractId?: string;
    XtrnlPractLocid?: string;
    ImageName?: string;
    ResourceLocId?: string;
    ReqstTransId: string;
    ShipmentTrackingNum: string;
    LogonCreateBy: string;
    Products: CloseAocProductInfo[];
  }
  
  export interface CloseAocProductInfo {
    MstrProdClientId: string;
    ProductName?: string;
    LotNumber?: string;
    ExpirationDate?: string;
    ShippedQuantity: number;
    ReceivedQuantity: number;
    ShipmentGuid: string;
    PackingSlipNumber: string;
  }