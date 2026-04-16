import { ComponentProps } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import type { ItemMaster, ItemPriceList, ItemStock } from "@/services/api"

// Catalog Stack Navigator types
export type CatalogStackParamList = {
  CatalogList: undefined
  ItemDetail: { item: ItemMaster }
  ItemStock: { item: ItemMaster; stocks?: ItemStock[] }
  ItemPricing: { item: ItemMaster; priceLists?: ItemPriceList[] }
}

export type CatalogStackScreenProps<T extends keyof CatalogStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<CatalogStackParamList, T>,
  MainTabScreenProps<"Catalog">
>

// Main Tab Navigator types
export type MainTabParamList = {
  Home: undefined
  Catalog: NavigatorScreenParams<CatalogStackParamList>
  Transactions: undefined
  Settings: undefined
}

// Auth Stack Navigator types
export type AuthStackParamList = {
  Login: undefined
}

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>

// App Stack Navigator types
export type AppStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  MainTabs: NavigatorScreenParams<MainTabParamList>
  Cart: undefined
  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

export interface NavigationProps extends Partial<
  ComponentProps<typeof NavigationContainer<AppStackParamList>>
> {}
