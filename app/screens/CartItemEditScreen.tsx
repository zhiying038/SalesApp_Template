import { FC, useState } from "react";
import { Alert, View, ViewStyle } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Button, Screen, Text, TextField } from "@/components";
import { Switch } from "@/components/Toggle/Switch";
import { useCart } from "@/contexts/cartContext";
import type { AppStackScreenProps } from "@/navigators/navigationTypes";
import { api, buildCartInput, CartItem } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

export const CartItemEditScreen: FC<AppStackScreenProps<"CartItemEdit">> = ({
  navigation,
  route,
}) => {
  const { item } = route.params;

  const { themed } = useAppTheme();
  const { cart, fetchCart } = useCart();
  const { control, handleSubmit, watch } = useForm<CartItem>({ defaultValues: item });

  const [isLoading, setIsLoading] = useState(false);

  useHeader(
    {
      title: "Edit Item",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [],
  );

  // ========== VARIABLES
  const canEditDiscount = watch("DiscountSource");

  // ========== EVENTS
  const onActionSave = async (values: CartItem) => {
    if (!cart) return;
    try {
      setIsLoading(true);
      const updatedItem: CartItem = {
        ...item,
        DiscountSource: values.DiscountSource,
        DiscountPercent: values.DiscountPercent,
      };
      const updatedItems = cart.Items.map((x) => (x.Id === item.Id ? updatedItem : x));
      const response = await api.addToCart(buildCartInput(cart, updatedItems));
      if (response.kind !== "ok") throw new Error(response.message);
      await fetchCart();
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== VIEWS
  return (
    <Screen preset="scroll" contentContainerStyle={themed($screen)}>
      <View style={themed($card)}>
        <Text weight="bold" size="xs">
          {item.ItemName}
        </Text>
        <Text size="xxs" style={$styles.dimText}>
          {item.ItemCode}
        </Text>
      </View>

      <Controller
        name="UnitPrice"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextField
            status="disabled"
            label="Unit Price"
            value={value?.toString()}
            keyboardType="number-pad"
            placeholder="Unit Price"
            containerStyle={themed($inputStyle)}
            onChangeText={(e) => onChange(+e)}
          />
        )}
      />

      <Controller
        name="DiscountPercent"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextField
            label="Discount (%)"
            value={value?.toString()}
            placeholder="Discount (%)"
            keyboardType="number-pad"
            editable={canEditDiscount === "MANUAL"}
            containerStyle={themed($inputStyle)}
            onChangeText={onChange}
          />
        )}
      />

      <Controller
        name="DiscountSource"
        control={control}
        render={({ field: { value, onChange } }) => (
          <View style={themed($inputStyle)}>
            <Text style={themed($inputStyle)} preset="formLabel">
              Overwrite Discount?
            </Text>
            <Switch
              disabled={item.FOC}
              value={value === "MANUAL"}
              onValueChange={(e) => onChange(e ? "MANUAL" : "VOLUME")}
            />
          </View>
        )}
      />

      <Button
        preset="filled"
        disabled={isLoading}
        style={themed($saveButton)}
        onPress={handleSubmit(onActionSave)}
      >
        Save
      </Button>
    </Screen>
  );
};

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
});

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  marginBottom: spacing.xs,
  gap: spacing.xxs,
});

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
});

const $inputStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
});
