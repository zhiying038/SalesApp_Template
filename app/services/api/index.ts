/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiErrorResponse, ApiResponse, ApisauceInstance, create } from "apisauce";

import Config from "@/config";

import { resetRoot } from "@/navigators/navigationUtilities";
import { storage } from "@/utils/storage";
import type {
  ApiConfig,
  ApiError,
  ApiProblem,
  BusinessPartner,
  Cart,
  CartInput,
  DashboardSummary,
  ItemDetails,
  ItemGroup,
  ItemMaster,
  LoginCredentials,
  LoginResponse,
  PaginatedItem,
} from "./types";

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
};

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance;
  config: ApiConfig;

  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config;
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    });
    this.apisauce.addAsyncRequestTransform(async (request) => {
      const connstring = storage.getString("ConnectionString");
      request.baseURL = connstring ?? Config.API_URL;
      if (!request.headers) return;
      const token = storage.getString("auth_token");
      if (token) request.headers.Authorization = `Bearer ${token}`;
    });
    this.apisauce.addAsyncResponseTransform(async (response) => {
      if (response.status === 401) {
        storage.delete("auth_token");
        resetRoot({ index: 0, routes: [{ name: "Auth", params: { screen: "Login" } }] });
      }
    });
  }

  handleError = (response: ApiErrorResponse<ApiError>): ApiProblem => {
    if (response.status === 401) {
      return { kind: "unauthorized", message: response.data?.errorMessage ?? "Session expired" };
    }

    const data = response.data;
    let errorMessage = "Unexpected error occurred";

    if (data && "StackTrace" in data) {
      errorMessage = data.Message;
    }
    if (data && "detail" in data) {
      errorMessage = data.detail;
    }

    return { kind: "bad-data", message: errorMessage };
  };

  async login(
    input: LoginCredentials,
  ): Promise<{ kind: "ok"; result: LoginResponse } | ApiProblem> {
    const response: ApiResponse<LoginResponse, ApiError> = await this.apisauce.post(
      "/api/v1/Account/Login",
      input,
    );

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", result: response.data as LoginResponse };
  }

  async getSummary(): Promise<{ kind: "ok"; summary: DashboardSummary[] } | ApiProblem> {
    const response: ApiResponse<DashboardSummary[], ApiError> = await this.apisauce.get(
      "/api/v1/Dashboard/Summary",
      {},
    );

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", summary: response.data ?? [] };
  }

  async getPaginatedItems(
    size = 50,
    page = 1,
    search?: string,
    groups?: string,
  ): Promise<{ kind: "ok"; result: PaginatedItem<ItemMaster> } | ApiProblem> {
    const response: ApiResponse<PaginatedItem<ItemMaster>, ApiError> = await this.apisauce.get(
      "/api/v1/Item/All",
      { size, page, search, groups },
    );

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", result: response.data as PaginatedItem<ItemMaster> };
  }

  async getItemGroups(): Promise<{ kind: "ok"; groups: ItemGroup[] } | ApiProblem> {
    const response: ApiResponse<ItemGroup[], ApiError> =
      await this.apisauce.get("/api/v1/Item/Groups");

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", groups: response.data ?? [] };
  }

  async getItemDetails(
    itemCode: string,
  ): Promise<{ kind: "ok"; result: ItemDetails } | ApiProblem> {
    const response: ApiResponse<ItemDetails, ApiError> = await this.apisauce.get("/api/v1/Item", {
      itemCode,
    });

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", result: response.data as ItemDetails };
  }

  async getCart(): Promise<{ kind: "ok"; result: Cart | null } | ApiProblem> {
    const response: ApiResponse<Cart, ApiError> = await this.apisauce.get("/api/v1/Cart");

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", result: response.data ?? null };
  }

  async getCustomer(
    cardCode: string,
  ): Promise<{ kind: "ok"; result: BusinessPartner } | ApiProblem> {
    const response: ApiResponse<BusinessPartner, ApiError> = await this.apisauce.get(
      "/api/v1/Customer",
      { cardCode },
    );

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", result: response.data as BusinessPartner };
  }

  async getPaginatedCustomers(
    size = 50,
    page = 1,
    search?: string,
  ): Promise<{ kind: "ok"; result: PaginatedItem<BusinessPartner> } | ApiProblem> {
    const response: ApiResponse<PaginatedItem<BusinessPartner>, ApiError> = await this.apisauce.get(
      "/api/v1/Customer/All",
      { search, size, page },
    );

    if (!response.ok) return this.handleError(response);

    return { kind: "ok", result: response.data as PaginatedItem<BusinessPartner> };
  }

  async addToCart(input: CartInput): Promise<{ kind: "ok" } | ApiProblem> {
    const response: ApiResponse<unknown, ApiError> = await this.apisauce.post(
      "/api/v1/Cart",
      input,
    );

    if (!response.ok) return this.handleError(response);

    return { kind: "ok" };
  }
}

// Singleton instance of the API for convenience
export const api = new Api();

export * from "./types";
