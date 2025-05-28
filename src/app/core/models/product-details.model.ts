import { API_Response } from './common.model';

export interface ProductList extends API_Response {
  data: {
    products: [ProductDetails];
    totalCount:number
  };
}

export interface ProductDetails {
  name: string;
  type: string;
  unitsPerPackage: number;
  userLimit: number;
  limit: number;
  ordered: number;
  id: string;
  max_quantity: number;
  increment: number;
  thumbnailURL: string;
  previewURL: string;
  available: number;
  manufacturerName: string;
  status: number;
  tags: string;
  isNew: Boolean;
  isDownloadable: Boolean;
  manufacturerLogo: string;
  productAdditionalUrls: Link[];
  packageType: string;
  isProductSelected?: boolean;
  selectedQuantity?: number;
  orderedQuantity?: number;
  productDetailsPageURL:string;
  availableQuantity?:number;
  isSubscribeable?:boolean;
  isSubscribed?:boolean
  description?: string
  selectedValue?;
  brandList?
}

export interface Link {
  linkUrl: string;
  linkTitle: string;
}
