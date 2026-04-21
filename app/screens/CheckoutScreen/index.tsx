import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import { RemarksModal, ShipDateModal } from "./components";
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

  const remarks = useRemarksEditor();
  const shipDate = useShipDateEditor();

  const selectedDocumentOption =
    DOCUMENT_TYPE_OPTIONS.find((o) => o.value === documentType) ?? DOCUMENT_TYPE_OPTIONS[0];

  const shippingAddress = useMemo(() => {
    const addresses = customer?.ShippingAddresses;
    if (!addresses || addresses.length === 0) return undefined;
    return addresses.find((a) => a.IsDefault) ?? addresses[0];
  }, [customer?.ShippingAddresses]);

  const billingAddress = useMemo(() => {
    const addresses = customer?.BillingAddresses;
    if (!addresses || addresses.length === 0) return undefined;
    return addresses.find((a) => a.IsDefault) ?? addresses[0];
  }, [customer?.BillingAddresses]);

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
            <Text size="xxs">Phone: {primaryContact.Mobile}</Text>
          </View>
        ) : (
          <Text>-</Text>
        )}
      </SectionCard>

      <SectionCard
        isLoading={isLoading}
        title="Shipping Address"
        trailing={shippingAddress?.AddressName}
      >
        <Text size="xxs">{!!shippingAddress ? formatAddress(shippingAddress) : "-"}</Text>
      </SectionCard>

      <SectionCard
        isLoading={isLoading}
        title="Billing Address"
        trailing={billingAddress?.AddressName}
      >
        <Text size="xxs">{!!billingAddress ? formatAddress(billingAddress) : "-"}</Text>
      </SectionCard>

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
