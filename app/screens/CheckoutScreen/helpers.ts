import { format, isValid, parseISO } from "date-fns";
import type { CustomerAddress, CustomerContact } from "@/services/api";
import { SHIP_DATE_DISPLAY_FORMAT } from "./constants";

export const formatAddress = (address?: CustomerAddress): string => {
  if (!address) return "";
  const parts = [
    address.Street,
    address.Block,
    [address.ZipCode, address.City].filter(Boolean).join(" "),
    address.State,
    address.Country,
  ].filter((x) => !!x && x.trim().length > 0);
  return parts.join(", ");
};

export const pickAddress = (
  addresses: CustomerAddress[] | undefined,
): CustomerAddress | undefined => {
  if (!addresses || addresses.length === 0) return undefined;
  return addresses.find((a) => a.IsDefault) ?? addresses[0];
};

export const pickPrimaryContact = (
  contacts: CustomerContact[] | undefined,
): CustomerContact | undefined => {
  if (!contacts || contacts.length === 0) return undefined;
  return contacts.find((c) => c.IsDefault) ?? contacts[0];
};

export const parseShipDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

export const formatShipDate = (value?: string | null): string => {
  const parsed = parseShipDate(value);
  if (!parsed) return "";
  return format(parsed, SHIP_DATE_DISPLAY_FORMAT);
};
