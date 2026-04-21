import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, TextStyle, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  Flex,
  Screen,
  SectionCard,
  Text,
  SegmentedButtons,
  BreakdownSummary,
} from "@/components";
import { useCart } from "@/contexts";
import type { AppStackScreenProps } from "@/navigators";
import { api, BusinessPartner } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatAddress, formatDate } from "@/utils";
import { useHeader } from "@/utils/useHeader";
import { AddressPickerModal, RemarksModal, ShipDateModal } from "./components";
import { useRemarksEditor, useShipDateEditor } from "./hooks";

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "order", label: "Sales Order", icon: "receipt-outline" },
  { value: "quotation", label: "Sales Quotation", icon: "document-text-outline" },
];

export const CheckoutScreen: FC<AppStackScreenProps<"Checkout">> = ({ navigation }) => {
  // ========== HOOKS
  const { themed, theme } = useAppTheme();
  const { cart, isLoading: isCartLoading } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [documentType, setDocumentType] = useState<string>("order");
  const [customer, setCustomer] = useState<BusinessPartner | null>(null);
  const [addressPickerType, setAddressPickerType] = useState<string>("");
  const [shippingAddressName, setShippingAddressName] = useState<string | undefined>();
  const [billingAddressName, setBillingAddressName] = useState<string | undefined>();

  const remarks = useRemarksEditor();
  const shipDate = useShipDateEditor();

  const selectedDocumentOption =
    DOCUMENT_TYPE_OPTIONS.find((o) => o.value === documentType) ?? DOCUMENT_TYPE_OPTIONS[0];

  const shippingAddresses = useMemo(
    () => customer?.ShippingAddresses ?? [],
    [customer?.ShippingAddresses],
  );

  const billingAddresses = useMemo(
    () => customer?.BillingAddresses ?? [],
    [customer?.BillingAddresses],
  );

  const shippingAddress = useMemo(() => {
    if (shippingAddresses.length === 0) return undefined;
    if (shippingAddressName) {
      const match = shippingAddresses.find((a) => a.Address === shippingAddressName);
      if (match) return match;
    }
    return shippingAddresses.find((a) => a.IsDefault) ?? shippingAddresses[0];
  }, [shippingAddresses, shippingAddressName]);

  const billingAddress = useMemo(() => {
    if (billingAddresses.length === 0) return undefined;
    if (billingAddressName) {
      const match = billingAddresses.find((a) => a.Address === billingAddressName);
      if (match) return match;
    }
    return billingAddresses.find((a) => a.IsDefault) ?? billingAddresses[0];
  }, [billingAddresses, billingAddressName]);

  // Latch the active picker type so picker content stays stable during the
  // sheet's close animation (prevents a flicker when addressPickerType flips
  // to null but the sheet is still animating out).
  const lastPickerTypeRef = useRef<string>("Ship");
  if (addressPickerType !== null) lastPickerTypeRef.current = addressPickerType;
  const displayPickerType = lastPickerTypeRef.current;

  const pickerAddresses = displayPickerType === "Ship" ? shippingAddresses : billingAddresses;
  const pickerSelectedName =
    displayPickerType === "Ship" ? shippingAddress?.Address : billingAddress?.Address;
  const pickerTitle =
    displayPickerType === "Ship" ? "Select Shipping Address" : "Select Billing Address";

  const primaryContact = useMemo(() => {
    if (!customer?.ContactPersons || customer.ContactPersons.length === 0) return undefined;
    return customer.ContactPersons.find((c) => c.IsDefault) ?? customer.ContactPersons[0];
  }, [customer?.ContactPersons]);

  useHeader(
    {
      title: "Checkout",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [navigation],
  );

  // ========== VARIABLES
  const items = cart?.Items ?? [];
  const currency = cart?.Currency ?? "";

  // ========== EVENTS
  const onGetCustomer = async (cardCode: string) => {
    try {
      const res = await api.getCustomer(cardCode);
      if (res.kind !== "ok") throw new Error(res.message);
      setCustomer(res.result);
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const onOpenAddressPicker = (type: string, addresses: unknown[]) => {
    if (addresses.length <= 1) return;
    setAddressPickerType(type);
  };

  const onSelectAddress = (address: { Address: string }) => {
    if (addressPickerType === "Ship") setShippingAddressName(address.Address);
    else if (addressPickerType === "Bill") setBillingAddressName(address.Address);
    setAddressPickerType("");
  };

  const onPlaceOrder = useCallback(async () => {
    if (!cart || items.length === 0) return;
    setIsPlacingOrder(true);
    try {
      // Placeholder — wire to a real checkout endpoint when available.
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
      const isOrder = documentType === "Order";
      Alert.alert(
        isOrder ? "Sales Order Created" : "Sales Quotation Created",
        isOrder
          ? "Your sales order has been submitted."
          : "Your sales quotation has been submitted.",
      );
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsPlacingOrder(false);
    }
  }, [cart, items.length, documentType, navigation]);

  // ========== EFFECTS
  useEffect(() => {
    if (!cart?.CardCode) return;
    onGetCustomer(cart.CardCode);
  }, [cart?.CardCode]);

  // ========== VIEWS
  if (isCartLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
      </Screen>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($emptyContainer)}>
        <Ionicons name="cart-outline" size={64} color={theme.colors.textDim} />
        <Text size="md" weight="medium" style={$styles.dimText}>
          Your cart is empty
        </Text>
      </Screen>
    );
  }

  return (
    <Screen preset="scroll" contentContainerStyle={themed($screen)}>
      <SegmentedButtons
        value={documentType}
        buttons={DOCUMENT_TYPE_OPTIONS}
        onValueChange={setDocumentType}
      />

      <SectionCard title="Customer" isLoading={isLoading}>
        <Text size="xxs" weight="medium" numberOfLines={1}>
          {cart.CardName || "—"}
        </Text>
        <Text size="xxs" style={$styles.dimText}>
          {cart.CardCode ?? ""}
        </Text>
      </SectionCard>

      <SectionCard title="Contact Person" isLoading={isLoading}>
        {!!primaryContact ? (
          <View>
            <Text size="xxs" weight="medium">
              {primaryContact.Name}
            </Text>
            <Text size="xxs">Phone: {primaryContact.Tel1}</Text>
          </View>
        ) : (
          <Text>-</Text>
        )}
      </SectionCard>

      <Pressable
        disabled={isLoading || shippingAddresses.length <= 1}
        onPress={() => onOpenAddressPicker("Ship", shippingAddresses)}
      >
        <SectionCard
          isLoading={isLoading}
          title="Shipping Address"
          trailing={
            shippingAddresses.length > 1 ? (
              <Ionicons name="chevron-down" size={14} color={theme.colors.textDim} />
            ) : null
          }
        >
          <Text size="xxs" weight="medium">
            {shippingAddress?.Address}
          </Text>
          <Text size="xxs">{!!shippingAddress ? formatAddress(shippingAddress) : "-"}</Text>
        </SectionCard>
      </Pressable>

      <Pressable
        disabled={isLoading || billingAddresses.length <= 1}
        onPress={() => onOpenAddressPicker("Bill", billingAddresses)}
      >
        <SectionCard
          isLoading={isLoading}
          title="Billing Address"
          trailing={
            billingAddresses.length > 1 ? (
              <Ionicons name="chevron-down" size={14} color={theme.colors.textDim} />
            ) : null
          }
        >
          <Text size="xxs" weight="medium">
            {billingAddress?.Address}
          </Text>
          <Text size="xxs">{!!billingAddress ? formatAddress(billingAddress) : "-"}</Text>
        </SectionCard>
      </Pressable>

      <SectionCard
        title="Items"
        trailing={`${items.length} ${items.length === 1 ? "item" : "items"}`}
      >
        {items.map((item) => (
          <View style={themed($itemRow)} key={item.Id}>
            <Flex.Row gutter={8} align="start">
              <Flex.Col flex="1">
                <Text size="xxs" numberOfLines={2}>
                  {item.ItemName}
                </Text>
                <Text size="xxs" style={$styles.dimText} numberOfLines={1}>
                  {item.ItemCode}
                </Text>
                <Text size="xxs" style={$styles.dimText}>
                  {currency} {item.UnitPrice.toFixed(2)} x {item.Quantity}
                </Text>
              </Flex.Col>
              <Flex.Col>
                <Text size="xxs" weight="bold" style={{ color: theme.colors.tint }}>
                  {currency} {item.LineTotal.toFixed(2)}
                </Text>
              </Flex.Col>
            </Flex.Row>

            <Pressable onPress={() => shipDate.open(item)}>
              <Flex.Row gutter={4} align="center">
                <Flex.Col>
                  <Ionicons
                    name={item?.ShipDate ? "calendar" : "calendar-outline"}
                    size={14}
                    color={item?.ShipDate ? theme.colors.tint : theme.colors.textDim}
                  />
                </Flex.Col>
                <Flex.Col>
                  <Text size="xxs" style={themed(item.ShipDate ? $text : $placeholder)}>
                    {item.ShipDate
                      ? formatDate(item.ShipDate, "EEE, dd MMM yyyy")
                      : "Set Ship Date"}
                  </Text>
                </Flex.Col>
              </Flex.Row>
            </Pressable>

            <Pressable onPress={() => remarks.open(item)}>
              <Flex.Row gutter={4} align="center">
                <Flex.Col>
                  <Ionicons
                    name={item?.Remarks ? "chatbubble-ellipses-outline" : "add-circle-outline"}
                    size={14}
                    color={item?.Remarks ? theme.colors.tint : theme.colors.textDim}
                  />
                </Flex.Col>
                <Flex.Col>
                  <Text size="xxs" style={themed(item.Remarks ? $text : $placeholder)}>
                    {item.Remarks ?? "Add remarks"}
                  </Text>
                </Flex.Col>
              </Flex.Row>
            </Pressable>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <BreakdownSummary
          currency={currency}
          totalAmount={cart?.DocTotal}
          discount={cart?.BPDiscAmount}
          taxAmount={cart?.TotalTaxAmount}
          subtotal={cart?.TotalBeforeDiscount}
        />
      </SectionCard>

      <Button
        preset="filled"
        style={themed($placeOrderButton)}
        disabled={isPlacingOrder || !cart.CardCode}
        onPress={onPlaceOrder}
      >
        {isPlacingOrder ? "Submitting..." : `Create ${selectedDocumentOption.label}`}
      </Button>

      <AddressPickerModal
        visible={addressPickerType !== null}
        title={pickerTitle}
        addresses={pickerAddresses}
        selectedName={pickerSelectedName}
        onSelect={onSelectAddress}
        onClose={() => setAddressPickerType("")}
      />

      <ShipDateModal
        item={shipDate.editorItem}
        draft={shipDate.draft}
        isSaving={shipDate.isSaving}
        onDraftChange={shipDate.setDraft}
        onPickPreset={shipDate.pickPreset}
        onClose={shipDate.close}
        onSave={shipDate.save}
      />

      <RemarksModal
        item={remarks.editorItem}
        draft={remarks.draft}
        isSaving={remarks.isSaving}
        onDraftChange={remarks.setDraft}
        onClose={remarks.close}
        onSave={remarks.save}
      />
    </Screen>
  );
};

const $placeOrderButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
});

const $itemRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.text,
});

const $placeholder: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.textDim,
});

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.md,
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.xl,
});
