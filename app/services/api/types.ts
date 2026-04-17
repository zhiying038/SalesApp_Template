import { GeneralApiProblem } from "./apiProblem";

/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface LoginCredentials {
  Username: string;
  Password: string;
}

export interface LoginResponse {
  token: string;
}

export type DashboardSummary = {
  No: number;
  Section: string;
  Title: string;
  Type: string | null;
  Value: string;
};

export type PaginatedItem<T = any> = {
  TotalRecords: number;
  TotalPages: number;
  PageSize: number;
  CurrentPage: number;
  Data: T[];
};

export type ItemMaster = {
  CodeBars: string;
  Image: string;
  ItemCode: string;
  ItemName: string;
  ItmsGrpNam: string;
};

export type ItemDetails = {
  CodeBars: string;
  FirmName: string;
  FrgnName: string;
  Images: string[];
  ItemCode: string;
  ItemName: string;
  ItmsGrpNam: string;
  PriceLists: ItemPriceList[];
  ProductInfo: string[];
  SalUnitMsr: string;
  Stocks: ItemStock[];
  UserText: string;
};

export type ItemPriceList = {
  Currency: string;
  ListNum: number;
  ListName: string;
  Price: number;
};

export type ItemStock = {
  Available: number;
  WhsCode: string;
  WhsName: string;
  OnHand: number;
  IsCommited: number;
  OnOrder: number;
};

export type Cart = {
  Id: string;
  BPDiscPrcnt: number;
  BPDiscAmount: number;
  CardCode: string;
  CardName: string;
  CreatedAt: string;
  Currency: string;
  DocTotal: number;
  IsActive: boolean;
  Items: CartItem[];
  ListName: string;
  ListNum: number;
  Rounding: number;
  Subtotal: number;
  TotalBeforeDiscount: number;
  TotalTaxAmount: number;
  UserId: number;
  UpdatedAt: string;
  WhsCode: string;
};

export type CartInput = Omit<Partial<Cart>, "Items"> & {
  Items: Partial<CartItem>[];
};

export type CartItem = {
  Id: string;
  CartId: string;
  Currency: string | null;
  DiscountAmount: number;
  DiscountPercent: number;
  DiscountSource: string;
  FOC?: boolean;
  ItemCode: string;
  ItemName: string;
  LineTotal: number;
  Remarks?: string;
  ShipDate?: string;
  Quantity: number;
  UnitPrice: number;
  VatGroup?: string | null;
  VatSum: number;
};

export type ItemGroup = {
  ItmsGrpCod: number;
  ItmsGrpNam: string;
};

export type BusinessPartner = {
  BillingAddresses?: CustomerAddress[];
  CardCode: string;
  CardName: string;
  Balance: number;
  OrdersBal: number;
  ListName: string;
  Email?: string;
  Phone1?: string;
  Phone2?: string;
  Cellular?: string;
  ContactPersons?: CustomerContact[];
  ShippingAddresses?: CustomerAddress[];
};

export type CustomerContact = {
  Name: string;
  Position?: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  IsDefault?: boolean;
};

export type AddressType = "Ship" | "Bill";

export type CustomerAddress = {
  AddressName: string;
  AddressType: AddressType;
  Street?: string;
  Block?: string;
  City?: string;
  State?: string;
  ZipCode?: string;
  Country?: string;
  IsDefault?: boolean;
};

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string;

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number;
}

export type ApiError = {
  detail: string;
  Code: string;
  errorMessage: string;
  Message: string;
  StackTrace: string;
};

export type ApiProblem = GeneralApiProblem & {
  message?: string;
};
