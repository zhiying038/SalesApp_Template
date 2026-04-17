import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { addDays, format, startOfDay } from "date-fns";
import { useCart } from "@/contexts/cartContext";
import { api, BusinessPartner, Cart, CartItem } from "@/services/api";
import { SHIP_DATE_FORMAT } from "./constants";
import { parseShipDate } from "./helpers";

export function useCustomerDetails(cardCode: string | undefined) {
  const [customer, setCustomer] = useState<BusinessPartner | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cardCode) {
      setCustomer(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await api.getCustomer(cardCode);
        if (cancelled) return;
        if (res.kind !== "ok") throw new Error(res.message);
        setCustomer(res.result);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Alert.alert("Error", message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cardCode]);

  return { customer, isLoading };
}

async function persistCartItemPatch(
  cart: Cart,
  fetchCart: () => Promise<void>,
  itemId: string,
  patch: Partial<CartItem>,
): Promise<void> {
  const updatedItems = cart.Items.map((x) => (x.Id === itemId ? { ...x, ...patch } : x));
  const res = await api.addToCart({ ...cart, Items: updatedItems });
  if (res.kind !== "ok") throw new Error(res.message);
  await fetchCart();
}

export function useRemarksEditor() {
  const { cart, fetchCart } = useCart();
  const [editorItem, setEditorItem] = useState<CartItem | null>(null);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const open = useCallback((item: CartItem) => {
    setEditorItem(item);
    setDraft(item.Remarks ?? "");
  }, []);

  const close = useCallback(() => {
    if (isSaving) return;
    setEditorItem(null);
    setDraft("");
  }, [isSaving]);

  const save = useCallback(async () => {
    if (!cart || !editorItem) return;
    const trimmed = draft.trim();
    const nextValue = trimmed.length === 0 ? undefined : trimmed;
    if ((editorItem.Remarks ?? "") === (nextValue ?? "")) {
      setEditorItem(null);
      setDraft("");
      return;
    }
    setIsSaving(true);
    try {
      await persistCartItemPatch(cart, fetchCart, editorItem.Id, { Remarks: nextValue });
      setEditorItem(null);
      setDraft("");
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsSaving(false);
    }
  }, [cart, draft, editorItem, fetchCart]);

  return { editorItem, draft, setDraft, isSaving, open, close, save };
}

export function useShipDateEditor() {
  const { cart, fetchCart } = useCart();
  const [editorItem, setEditorItem] = useState<CartItem | null>(null);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const open = useCallback((item: CartItem) => {
    setEditorItem(item);
    const parsed = parseShipDate(item.ShipDate);
    setDraft(parsed ? format(parsed, SHIP_DATE_FORMAT) : "");
  }, []);

  const close = useCallback(() => {
    if (isSaving) return;
    setEditorItem(null);
    setDraft("");
  }, [isSaving]);

  const pickPreset = useCallback((offsetDays: number) => {
    const date = addDays(startOfDay(new Date()), offsetDays);
    setDraft(format(date, SHIP_DATE_FORMAT));
  }, []);

  const save = useCallback(async () => {
    if (!cart || !editorItem) return;
    const trimmed = draft.trim();
    let nextValue: string | undefined;
    if (trimmed.length === 0) {
      nextValue = undefined;
    } else {
      const parsed = parseShipDate(trimmed);
      if (!parsed) {
        Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format.");
        return;
      }
      nextValue = format(parsed, SHIP_DATE_FORMAT);
    }
    if ((editorItem.ShipDate ?? "") === (nextValue ?? "")) {
      setEditorItem(null);
      setDraft("");
      return;
    }
    setIsSaving(true);
    try {
      await persistCartItemPatch(cart, fetchCart, editorItem.Id, { ShipDate: nextValue });
      setEditorItem(null);
      setDraft("");
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsSaving(false);
    }
  }, [cart, draft, editorItem, fetchCart]);

  return { editorItem, draft, setDraft, isSaving, open, close, pickPreset, save };
}
