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
import { BreakdownSummary, Button, Flex, Screen, Text } from "@/components";
import { Divider } from "@/components/Divider";
import { useCart } from "@/contexts/cartContext";
import { useEvent } from "@/hooks";
import type { AppStackScreenProps } from "@/navigators/navigationTypes";
import { api, BusinessPartner, CartItem } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

const DEBOUNCE_MS = 600;

export const CartScreen: FC<AppStackScreenProps<"Cart">> = ({ navigation }) => {
  // ========== HOOKS & VARIABLES
  const { themed, theme } = useAppTheme();
  const { cart, isLoading, fetchCart } = useCart();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [savingItems, setSavingItems] = useState<Set<string>>(new Set());

  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const event = useEvent();
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const currency = cart?.Currency ?? "";

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => {
      if (prev) setSelectedItems(new Set());
      return !prev;
    });
  }, []);

  useHeader(
    {
      title: "Cart",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
      RightActionComponent: (
        <Pressable
          onPress={toggleSelectMode}
          hitSlop={8}
          style={themed($headerAction)}
          accessibilityRole="button"
          accessibilityLabel={selectMode ? "Cancel selection" : "Select items"}
        >
          <Ionicons
            name={selectMode ? "close" : "checkbox-outline"}
            size={24}
            color={theme.colors.tint}
          />
        </Pressable>
      ),
    },
    [selectMode, toggleSelectMode, theme.colors.tint, themed],
  );

  // ========== EVENTS
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

  const toggleSelection = useCallback((itemCode: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemCode)) next.delete(itemCode);
      else next.add(itemCode);
      return next;
    });
  }, []);

  const removeSelected = useCallback(async () => {
    if (!cart || selectedItems.size === 0) return;
    try {
      const updatedItems = cart.Items.filter((x) => !selectedItems.has(x.ItemCode));
      const res = await api.addToCart({ ...cart, Items: updatedItems });
      if (res.kind !== "ok") throw new Error(res.message);
      await fetchCart();
      setSelectedItems(new Set());
      setSelectMode(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    }
  }, [cart, selectedItems]);

  const onSelectCustomer = useCallback(
    async (customer: BusinessPartner) => {
      if (!cart) return;
      try {
        const res = await api.addToCart({
          ...cart,
          CardCode: customer.CardCode,
          CardName: customer.CardName,
        });
        if (res.kind !== "ok") throw new Error(res.message);
        await fetchCart();
        navigation.goBack();
      } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        Alert.alert("Error", message);
      }
    },
    [cart, fetchCart, navigation],
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

  useEffect(() => {
    event.on("CartCustomerSelection", onSelectCustomer);
    return () => {
      event.off("CartCustomerSelection", onSelectCustomer);
    };
  }, [onSelectCustomer]);

  // ========== VIEWS
  const renderItem: ListRenderItem<CartItem> = useCallback(
    ({ item }) => {
      const qty = quantities[item.ItemCode] ?? item.Quantity;
      const currency = cart?.Currency ?? item.Currency ?? "";
      const isSelected = selectedItems.has(item.ItemCode);

      return (
        <Pressable
          style={themed($itemContainer)}
          onPress={
            selectMode
              ? () => toggleSelection(item.ItemCode)
              : () => navigation.navigate("CartItemEdit", { item })
          }
        >
          <Flex.Row gutter={8} align="start">
            {selectMode && (
              <Flex.Col>
                <Pressable
                  onPress={() => toggleSelection(item.ItemCode)}
                  hitSlop={8}
                  style={themed($checkboxHitbox)}
                >
                  <Ionicons
                    name={isSelected ? "checkbox" : "square-outline"}
                    size={22}
                    color={isSelected ? theme.colors.tint : theme.colors.textDim}
                  />
                </Pressable>
              </Flex.Col>
            )}
            <Flex.Col flex="1">
              <Text size="xxs" numberOfLines={2}>
                {item.ItemName}
              </Text>
              <Text size="xxs" style={$styles.dimText} numberOfLines={1}>
                {item.ItemCode}
              </Text>

              <Flex.Row gutter={8} align="end" style={themed($priceContainer)}>
                <Flex.Col flex="1">
                  <Text size="xxs" style={$styles.dimText}>
                    Unit Price: {currency} {item.UnitPrice.toFixed(2)}
                  </Text>
                  {item.DiscountPercent > 0 && (
                    <Text size="xxs" style={$styles.dimText}>
                      Price After Discount: {currency}{" "}
                      {(item.UnitPrice - item.DiscountAmount).toFixed(2)}
                    </Text>
                  )}
                  <Text size="xs" weight="bold" style={{ color: theme.colors.tint }}>
                    {currency} {item.LineTotal.toFixed(2)}
                  </Text>
                </Flex.Col>
                {!selectMode && (
                  <Flex.Col>
                    <Flex.Row align="center" gutter={4}>
                      <Flex.Col>
                        <Pressable
                          style={themed($qtyBtn)}
                          onPress={() => handleQuantityChange(item.ItemCode, Math.max(0, qty - 1))}
                        >
                          <Ionicons name="remove" size={14} color={theme.colors.text} />
                        </Pressable>
                      </Flex.Col>
                      <Flex.Col>
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
                      </Flex.Col>
                      <Flex.Col>
                        <Pressable
                          style={themed($qtyBtn)}
                          onPress={() => handleQuantityChange(item.ItemCode, qty + 1)}
                        >
                          <Ionicons name="add" size={14} color={theme.colors.text} />
                        </Pressable>
                      </Flex.Col>
                    </Flex.Row>
                  </Flex.Col>
                )}
              </Flex.Row>
            </Flex.Col>
          </Flex.Row>
        </Pressable>
      );
    },
    [quantities, savingItems, cart?.Currency, theme.colors, selectMode, selectedItems],
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
        <Text size="md" weight="medium" style={$styles.dimText}>
          Your cart is empty
        </Text>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screen)}>
      <FlashList
        data={items}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        contentContainerStyle={themed($listContent)}
        keyExtractor={(item) => item.Id.toString()}
      />

      <View style={themed($summary)}>
        <Pressable
          onPress={() =>
            navigation.navigate("CustomerSelect", { eventName: "CartCustomerSelection" })
          }
        >
          <Flex.Row gutter={8} align="center">
            <Flex.Col flex="1">
              <Text size="xxs" style={$styles.dimText}>
                Customer
              </Text>
            </Flex.Col>
            <Flex.Col>
              <Text
                size="xxs"
                numberOfLines={1}
                style={!cart?.CardName ? { color: theme.colors.error } : undefined}
              >
                {cart?.CardName ? cart.CardName : "Select customer"}
              </Text>
            </Flex.Col>
          </Flex.Row>
        </Pressable>

        <Divider verticalInset />

        {cart?.ListName && (
          <Flex.Row gutter={8} align="center">
            <Flex.Col flex="1">
              <Text size="xxs" style={$styles.dimText}>
                Price List
              </Text>
            </Flex.Col>
            <Flex.Col>
              <Text size="xxs" weight="medium">
                {cart.ListName}
              </Text>
            </Flex.Col>
          </Flex.Row>
        )}

        <Divider verticalInset />

        <Flex.Row justify="between" align="center">
          <Flex.Col>
            <Flex.Row align="center">
              <Text size="xxs" style={{ marginRight: 4 }}>
                Total
              </Text>
              <Pressable onPress={() => setBreakdownVisible(true)} hitSlop={8}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={theme.colors.textDim}
                />
              </Pressable>
            </Flex.Row>
          </Flex.Col>
          <Flex.Col>
            <Text size="xxs" weight="bold">
              {currency} {(cart?.DocTotal ?? 0).toFixed(2)}
            </Text>
          </Flex.Col>
        </Flex.Row>

        {selectMode ? (
          <Button
            preset="filled"
            style={themed($checkoutButton)}
            disabled={selectedItems.size === 0}
            onPress={removeSelected}
          >
            {selectedItems.size > 0 ? `Remove Selected (${selectedItems.size})` : "Remove Selected"}
          </Button>
        ) : (
          <Button
            preset="filled"
            style={themed($checkoutButton)}
            disabled={!cart?.CardCode || items.length === 0}
            onPress={() => navigation.navigate("Checkout")}
          >
            Checkout
          </Button>
        )}
      </View>

      <BreakdownSummary
        currency={currency}
        visible={breakdownVisible}
        totalAmount={cart?.DocTotal}
        discount={cart?.BPDiscAmount}
        taxAmount={cart?.TotalTaxAmount}
        subtotal={cart?.TotalBeforeDiscount}
        onClose={() => setBreakdownVisible(false)}
      />
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

const $itemContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $priceContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
});

const $checkboxHitbox: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingRight: spacing.xxs,
});

const $headerAction: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: "100%",
  paddingHorizontal: spacing.md,
  alignItems: "center",
  justifyContent: "center",
});

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

const $summary: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.lg,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  backgroundColor: colors.background,
  gap: spacing.xxs,
});

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
