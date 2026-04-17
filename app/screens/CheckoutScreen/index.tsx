import { FC, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Screen, Text } from "@/components";
import { useCart } from "@/contexts/cartContext";
import type { AppStackScreenProps } from "@/navigators/navigationTypes";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";
import {
  AddressCard,
  ContactCard,
  CustomerCard,
  DocumentTypeSelector,
  SummaryCard,
  ItemsCard,
  RemarksModal,
  ShipDateModal,
} from "./components";
import { DOCUMENT_TYPE_OPTIONS, type DocumentType } from "./constants";
import { pickAddress, pickPrimaryContact } from "./helpers";
import { useCustomerDetails, useRemarksEditor, useShipDateEditor } from "./hooks";
import { $centered, $emptyContainer, $screen } from "./styles";

export const CheckoutScreen: FC<AppStackScreenProps<"Checkout">> = ({ navigation }) => {
  const { themed, theme } = useAppTheme();
  const { cart, isLoading: isCartLoading } = useCart();

  const [documentType, setDocumentType] = useState<DocumentType>("Order");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { customer, isLoading: isCustomerLoading } = useCustomerDetails(cart?.CardCode);
  const remarks = useRemarksEditor();
  const shipDate = useShipDateEditor();

  const selectedDocumentOption =
    DOCUMENT_TYPE_OPTIONS.find((o) => o.value === documentType) ?? DOCUMENT_TYPE_OPTIONS[0];

  const items = cart?.Items ?? [];
  const currency = cart?.Currency ?? "";

  const shippingAddress = useMemo(
    () => pickAddress(customer?.ShippingAddresses),
    [customer?.ShippingAddresses],
  );
  const billingAddress = useMemo(
    () => pickAddress(customer?.BillingAddresses),
    [customer?.BillingAddresses],
  );
  const primaryContact = useMemo(
    () => pickPrimaryContact(customer?.ContactPersons),
    [customer?.ContactPersons],
  );

  useHeader(
    {
      title: "Checkout",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [navigation],
  );

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

  if (isCartLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$centered}>
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
      <DocumentTypeSelector value={documentType} onChange={setDocumentType} />

      <CustomerCard
        cardName={cart.CardName}
        cardCode={cart.CardCode}
        customer={customer}
        isLoading={isCustomerLoading}
      />

      <ContactCard contact={primaryContact} isLoading={isCustomerLoading} />

      <AddressCard
        title="Shipping Address"
        address={shippingAddress}
        isLoading={isCustomerLoading}
      />
      <AddressCard title="Billing Address" address={billingAddress} isLoading={isCustomerLoading} />

      <ItemsCard
        items={items}
        currency={currency}
        onEditShipDate={shipDate.open}
        onEditRemarks={remarks.open}
      />

      <SummaryCard cart={cart} />

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
