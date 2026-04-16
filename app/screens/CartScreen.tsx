import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Button, Flex, Screen, Text } from "@/components";
import { Divider } from "@/components/Divider";
import { useCart } from "@/contexts/cartContext";
import type { AppStackScreenProps } from "@/navigators/navigationTypes";
import { api, CartItem } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

const DEBOUNCE_MS = 600;

export const CartScreen: FC<AppStackScreenProps<"Cart">> = ({ navigation }) => {
  // ========== HOOKS & VARIABLES
  const { themed, theme } = useAppTheme();
  const { cart, isLoading, fetchCart } = useCart();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const currency = cart?.Currency ?? "";
  const hasDiscount = (cart?.TotalDiscount ?? 0) > 0;
  const hasTax = (cart?.TotalTaxAmount ?? 0) > 0;

  useHeader(
    {
      title: "Cart",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [],
  );

  // ========== EVENTS
  const keyExtractor = useCallback((item: CartItem) => item.Id || item.ItemCode, []);

  const saveQuantity = useCallback(
    async (itemCode: string, newQty: number) => {
      if (!cart) return;

      setSavingItems((prev) => new Set(prev).add(itemCode));
      try {
        const updatedItems =
          newQty === 0
            ? cart.Items.filter((x) => x.ItemCode !== itemCode)
            : cart.Items.map((x) => (x.ItemCode === itemCode ? { ...x, Quantity: newQty } : x));

        const res = await api.addToCart({ ...cart, Items: updatedItems });
        if (res.kind !== "ok") throw new Error(res.message);
        await fetchCart();
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Alert.alert("Error", message);
        // Revert optimistic update on failure
        setQuantities((prev) => ({
          ...prev,
          [itemCode]: cart.Items.find((x) => x.ItemCode === itemCode)?.Quantity ?? prev[itemCode],
        }));
      } finally {
        setSavingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemCode);
          return next;
        });
      }
    },
    [cart, fetchCart],
  );

  const handleQuantityChange = useCallback(
    (itemCode: string, newQty: number) => {
      setQuantities((prev) => ({ ...prev, [itemCode]: newQty }));
      if (timersRef.current[itemCode]) {
        clearTimeout(timersRef.current[itemCode]);
      }
      timersRef.current[itemCode] = setTimeout(() => {
        saveQuantity(itemCode, newQty);
      }, DEBOUNCE_MS);
    },
    [saveQuantity],
  );

  // ========== EFFECTS
  useEffect(() => {
    if (!cart) return;
    setQuantities(Object.fromEntries(cart.Items.map((item) => [item.ItemCode, item.Quantity])));
  }, [cart]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  // ========== VIEWS
  const renderItem: ListRenderItem<CartItem> = useCallback(
    ({ item }) => {
      const qty = quantities[item.ItemCode] ?? item.Quantity;
      const currency = cart?.Currency ?? item.Currency ?? "";

      return (
        <View style={themed($itemRow)}>
          <View style={$itemInfo}>
            <Text size="xxs" numberOfLines={2} style={$itemName}>
              {item.ItemName}
            </Text>
            <Text size="xxs" style={themed($dimText)} numberOfLines={1}>
              {item.ItemCode}
            </Text>

            <View style={$priceQtyRow}>
              <View style={$priceBlock}>
                {item.DiscountPercent > 0 && (
                  <Text size="xxs" style={themed($strikethrough)}>
                    {currency} {item.OriginalAmount.toFixed(2)}
                  </Text>
                )}
                <Text size="sm" weight="bold" style={{ color: theme.colors.tint }}>
                  {currency} {item.LineTotal.toFixed(2)}
                </Text>
              </View>

              <View style={$qtyControl}>
                <Pressable
                  style={themed($qtyBtn)}
                  onPress={() => handleQuantityChange(item.ItemCode, Math.max(0, qty - 1))}
                >
                  <Ionicons name="remove" size={14} color={theme.colors.text} />
                </Pressable>
                <TextInput
                  selectTextOnFocus
                  keyboardType="number-pad"
                  value={String(qty)}
                  style={themed($qtyInput)}
                  onChangeText={(text) => {
                    const num = parseInt(text, 10);
                    const finalNum = Number.isNaN(num) || num < 0 ? 0 : num;
                    handleQuantityChange(item.ItemCode, finalNum);
                  }}
                />
                <Pressable
                  style={themed($qtyBtn)}
                  onPress={() => handleQuantityChange(item.ItemCode, qty + 1)}
                >
                  <Ionicons name="add" size={14} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      );
    },
    [quantities, savingItems, handleQuantityChange, cart?.Currency, theme.colors, themed],
  );

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$centered}>
        <ActivityIndicator size="large" color={theme.colors.tint} />
      </Screen>
    );
  }

  const items = cart?.Items ?? [];

  if (items.length === 0) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($emptyContainer)}>
        <Ionicons name="cart-outline" size={64} color={theme.colors.textDim} />
        <Text size="md" weight="medium" style={themed($dimText)}>
          Your cart is empty
        </Text>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screen)}>
      <FlashList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />

      <View style={themed($summary)}>
        <Flex.Row justify="between" align="center" style={$summaryRow}>
          <Text size="sm" style={themed($dimText)}>
            Subtotal
          </Text>
          <Text size="sm">
            {currency} {(cart?.Subtotal ?? 0).toFixed(2)}
          </Text>
        </Flex.Row>

        {hasDiscount && (
          <Flex.Row justify="between" align="center" style={$summaryRow}>
            <Text size="sm" style={themed($dimText)}>
              Discount
            </Text>
            <Text size="sm" style={{ color: theme.colors.tint }}>
              -{currency} {(cart?.TotalDiscount ?? 0).toFixed(2)}
            </Text>
          </Flex.Row>
        )}

        {hasTax && (
          <Flex.Row justify="between" align="center" style={$summaryRow}>
            <Text size="sm" style={themed($dimText)}>
              Tax
            </Text>
            <Text size="sm">
              {currency} {(cart?.TotalTaxAmount ?? 0).toFixed(2)}
            </Text>
          </Flex.Row>
        )}

        <Divider verticalInset />

        <Flex.Row justify="between" align="center" style={$summaryRow}>
          <Text size="md" weight="bold">
            Total
          </Text>
          <Text size="md" weight="bold">
            {currency} {(cart?.DocTotal ?? 0).toFixed(2)}
          </Text>
        </Flex.Row>

        <Button preset="filled" style={themed($checkoutButton)} onPress={() => {}}>
          Proceed to Checkout
        </Button>
      </View>
    </Screen>
  );
};

const $screen: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.sm,
});

const $itemRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  gap: spacing.sm,
});

const $itemInfo: ViewStyle = {
  flex: 1,
  gap: 4,
};

const $itemName: TextStyle = {
  lineHeight: 18,
};

const $priceQtyRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  marginTop: 6,
};

const $priceBlock: ViewStyle = {
  gap: 1,
};

const $qtyControl: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
};

const $qtyBtn: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
  alignItems: "center",
  justifyContent: "center",
});

const $qtyInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  minWidth: 28,
  height: 24,
  color: colors.text,
  textAlign: "center",
  fontSize: 13,
  fontWeight: "600",
  padding: 0,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 4,
  paddingHorizontal: 6,
});

const $dimText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $strikethrough: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textDecorationLine: "line-through",
  fontSize: 10,
});

const $summary: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  backgroundColor: colors.background,
  gap: spacing.xs,
});

const $summaryRow: ViewStyle = {
  paddingVertical: 2,
};

const $checkoutButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.xl,
});

const $centered: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
};
