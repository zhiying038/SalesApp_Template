import { FC, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageStyle,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Skeleton } from "moti/skeleton";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Carousel from "react-native-reanimated-carousel";
import {
  AutoImage,
  Badge,
  Button,
  Flex,
  QuantityInput,
  Screen,
  SkeletonText,
  Text,
} from "@/components";
import { useCart } from "@/contexts";
import type { CatalogStackScreenProps } from "@/navigators/navigationTypes";
import { api, CartInput, ItemDetails } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_SIZE = SCREEN_WIDTH;

const SECTIONS: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  screen: "ItemStock" | "ItemPricing";
}[] = [
  { label: "Stock", icon: "layers-outline", screen: "ItemStock" },
  { label: "Pricing", icon: "pricetag-outline", screen: "ItemPricing" },
];

export const ItemDetailScreen: FC<CatalogStackScreenProps<"ItemDetail">> = ({
  route,
  navigation,
}) => {
  const { item } = route.params;

  // ========== HOOKS & VARIABLES
  const { themed, theme } = useAppTheme();
  const { cart, getQuantity, fetchCart } = useCart();

  const cartQuantity = getQuantity(item.ItemCode);
  const [quantity, setQuantity] = useState(() => getQuantity(item.ItemCode));
  const [details, setDetails] = useState<ItemDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const images: string[] = details?.Images?.length
    ? details.Images
    : item.Image
      ? [item.Image]
      : [];

  useHeader(
    {
      title: item.ItemCode,
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [item.ItemCode],
  );

  // ========== EFFECTS
  useEffect(() => {
    api.getItemDetails(item.ItemCode).then((res) => {
      if (res.kind === "ok") {
        setDetails(res.result);
      } else {
        Alert.alert("Error", res.message ?? "Failed to load item details");
      }
      setIsLoading(false);
    });
  }, [item.ItemCode]);

  const handleCartAction = async () => {
    setIsSubmitting(true);
    try {
      const cartItem = cart?.Items.find((x) => x.ItemCode === item.ItemCode);
      let updatedItems: CartInput["Items"];
      if (quantity === 0) {
        updatedItems = (cart?.Items ?? []).filter((x) => x.ItemCode !== item.ItemCode);
      } else if (cartItem) {
        updatedItems = (cart?.Items ?? []).map((x) =>
          x.ItemCode === item.ItemCode ? { ...x, Quantity: quantity } : x,
        );
      } else {
        updatedItems = [
          ...(cart?.Items ?? []),
          { ItemCode: item.ItemCode, ItemName: item.ItemName, Quantity: quantity },
        ];
      }
      const res = await api.addToCart(
        cart ? { ...cart, Items: updatedItems } : { Items: updatedItems },
      );
      if (res.kind !== "ok") throw new Error(res.message);
      const action = quantity === 0 ? "Removed item from" : cartItem ? "Updated" : "Added item to";
      await fetchCart();
      Alert.alert("Success", `${action} cart successfully`);
      navigation.goBack();
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== VIEWS
  const renderCarouselItem = useCallback(
    ({ item: uri }: { item: string }) => (
      <AutoImage source={{ uri }} style={$image} resizeMode="cover" />
    ),
    [],
  );

  if (isLoading) {
    return (
      <Screen preset="scroll" contentContainerStyle={themed($screen)}>
        <Skeleton>
          <View style={themed($skeleton)}>
            <SkeletonText height={20} width="60%" />
            <SkeletonText width="40%" height={16} />
          </View>
        </Skeleton>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={$styles.flex1} behavior="padding">
      <Screen preset="scroll">
        <ScrollView
          style={$styles.flex1}
          contentContainerStyle={themed($screen)}
          keyboardShouldPersistTaps="handled"
        >
          <View style={themed($imageContainer)}>
            {images.length > 0 ? (
              <Carousel
                snapEnabled
                data={images}
                pagingEnabled
                width={IMAGE_SIZE}
                height={IMAGE_SIZE}
                loop={images.length > 1}
                renderItem={renderCarouselItem}
              />
            ) : (
              <View style={[$image, themed($imagePlaceholder)]}>
                <Ionicons name="image-outline" size={64} color={theme.colors.palette.neutral400} />
              </View>
            )}
          </View>

          <View style={themed($infoCard)}>
            <Text weight="bold" size="sm" numberOfLines={2}>
              {item.ItemCode}
            </Text>
            <Text size="xs" style={themed($dimText)} numberOfLines={3}>
              {details?.ItemName ?? item.ItemName}
            </Text>

            {!!details?.FrgnName && (
              <Text size="xs" style={themed($dimText)} numberOfLines={2}>
                {details.FrgnName}
              </Text>
            )}

            <Badge label={details?.ItmsGrpNam ?? item.ItmsGrpNam} style={$badge} />

            <Flex.Row gutter={4} align="center">
              <Flex.Col>
                <Ionicons name="business-outline" size={14} color={theme.colors.textDim} />
              </Flex.Col>
              <Flex.Col>
                <Text size="xs" style={themed($dimText)}>
                  {details?.FirmName ?? "-"}
                </Text>
              </Flex.Col>
            </Flex.Row>

            <Flex.Row gutter={4} align="center">
              <Flex.Col>
                <Ionicons name="cube-outline" size={14} color={theme.colors.textDim} />
              </Flex.Col>
              <Flex.Col>
                <Text size="xs" style={themed($dimText)}>
                  {details?.SalUnitMsr ?? "-"}
                </Text>
              </Flex.Col>
            </Flex.Row>

            {!!(details?.CodeBars ?? item.CodeBars) && (
              <Flex.Row gutter={4} align="center">
                <Flex.Col>
                  <Ionicons name="barcode-outline" size={16} color={theme.colors.textDim} />
                </Flex.Col>
                <Flex.Col>
                  <Text size="xs" style={themed($dimText)}>
                    {details?.CodeBars ?? item.CodeBars}
                  </Text>
                </Flex.Col>
              </Flex.Row>
            )}
          </View>

          {!!details?.UserText && (
            <>
              <Text size="xs" weight="semiBold" style={themed($sectionTitle)}>
                Remarks
              </Text>
              <View style={themed($infoCard)}>
                <Text size="xs" style={themed($dimText)}>
                  {details.UserText}
                </Text>
              </View>
            </>
          )}

          {details?.ProductInfo && details.ProductInfo.length > 0 && (
            <>
              <Text size="xs" weight="semiBold" style={themed($sectionTitle)}>
                Product Info
              </Text>
              <View style={themed($infoCard)}>
                {details.ProductInfo.map((line, idx) => (
                  <View key={idx} style={$bulletRow}>
                    <View style={themed($bullet)} />
                    <Text size="xs" style={[themed($dimText), $styles.flex1]}>
                      {line}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text size="xs" weight="semiBold" style={themed($sectionTitle)}>
            More Info
          </Text>
          {SECTIONS.map(({ label, icon, screen }) => (
            <Pressable
              key={screen}
              style={themed($navCard)}
              onPress={() => {
                if (screen === "ItemStock") {
                  navigation.navigate("ItemStock", { item, stocks: details?.Stocks ?? [] });
                } else {
                  navigation.navigate("ItemPricing", {
                    item,
                    priceLists: details?.PriceLists ?? [],
                  });
                }
              }}
            >
              <Flex.Row gutter={4} align="center">
                <Flex.Col>
                  <Ionicons name={icon} size={22} color={theme.colors.tint} />
                </Flex.Col>
                <Flex.Col grow="grow">
                  <Text size="sm" weight="medium" style={$styles.flex1}>
                    {label}
                  </Text>
                </Flex.Col>
                <Flex.Col>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textDim} />
                </Flex.Col>
              </Flex.Row>
            </Pressable>
          ))}
        </ScrollView>
      </Screen>

      <Flex.Row justify="between" align="center" style={themed($footer)}>
        <Flex.Col>
          <QuantityInput value={quantity} onChange={setQuantity} />
        </Flex.Col>
        <Flex.Col>
          <Button
            preset="filled"
            style={{
              width: 140,
              ...(quantity === 0 && cartQuantity > 0 && { backgroundColor: theme.colors.error }),
            }}
            disabled={isSubmitting || (quantity === 0 && cartQuantity === 0)}
            onPress={handleCartAction}
            RightAccessory={
              isSubmitting
                ? () => <ActivityIndicator size="small" color="white" style={{ marginLeft: 8 }} />
                : undefined
            }
          >
            {quantity === 0 && cartQuantity > 0 ? "Remove" : cartQuantity > 0 ? "Update" : "Add"}
          </Button>
        </Flex.Col>
      </Flex.Row>
    </KeyboardAvoidingView>
  );
};

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
});

const $imageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  marginHorizontal: -spacing.lg,
  overflow: "hidden",
});

const $image: ImageStyle = {
  width: IMAGE_SIZE,
  height: IMAGE_SIZE,
};

const $imagePlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
});

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  marginBottom: spacing.lg,
  gap: spacing.xs,
});

const $dimText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $badge: ViewStyle = { marginTop: 2 };

const $bulletRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,
};

const $bullet: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 5,
  height: 5,
  borderRadius: 2.5,
  backgroundColor: colors.tint,
  marginTop: 5,
  flexShrink: 0,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginBottom: spacing.xs,
  textTransform: "uppercase",
  letterSpacing: 0.8,
});

const $navCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  marginBottom: spacing.sm,
});

const $footer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral300,
  backgroundColor: colors.background,
});

const $skeleton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});
