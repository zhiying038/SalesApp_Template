import { FC } from "react";
import { View, ViewStyle, TextStyle } from "react-native";
import { Flex, Screen, SkeletonText, Text } from "@/components";
import type { CatalogStackScreenProps } from "@/navigators";
import { ItemPriceList } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

const PriceRow: FC<{ priceList: ItemPriceList; isLast: boolean }> = ({ priceList, isLast }) => {
  const { themed } = useAppTheme();
  const formatted = priceList.Price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <Flex.Row gutter={8} style={[themed($row), !isLast && themed($rowBorder)]}>
      <Flex.Col flex="1">
        <Text size="xs" style={themed($listName)}>
          {priceList.ListName}
        </Text>
      </Flex.Col>
      <Flex.Col>
        <Text size="xs" weight="semiBold">
          {priceList.Currency} {formatted}
        </Text>
      </Flex.Col>
    </Flex.Row>
  );
};

const SkeletonRows: FC = () => {
  const { themed } = useAppTheme();
  return (
    <View style={themed($card)}>
      {Array.from({ length: 4 }).map((_, i, arr) => (
        <View key={i} style={[themed($row), i < arr.length - 1 && themed($rowBorder)]}>
          <SkeletonText height={16} width="40%" />
          <SkeletonText height={16} width="25%" />
        </View>
      ))}
    </View>
  );
};

export const ItemPricingScreen: FC<CatalogStackScreenProps<"ItemPricing">> = ({
  route,
  navigation,
}) => {
  const { item, priceLists = [] } = route.params;

  // ========== HOOKS
  const { themed } = useAppTheme();

  useHeader(
    {
      title: "Pricing",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [],
  );

  // ========== SCREENS
  return (
    <Screen preset="scroll" contentContainerStyle={themed($screen)}>
      <View style={themed($header)}>
        <Text weight="bold" size="md">
          {item.ItemCode}
        </Text>
        <Text size="xs" style={themed($dimText)} numberOfLines={2}>
          {item.ItemName}
        </Text>
      </View>

      {priceLists === null ? (
        <SkeletonRows />
      ) : (
        <View style={themed($card)}>
          {priceLists.map((pl, i) => (
            <PriceRow key={pl.ListName} priceList={pl} isLast={i === priceLists.length - 1} />
          ))}
        </View>
      )}
    </Screen>
  );
};

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
});

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  marginBottom: spacing.lg,
  gap: spacing.xxs,
});

const $card: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  overflow: "hidden",
});

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
});

const $rowBorder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
});

const $listName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  flex: 1,
  marginRight: 8,
});

const $dimText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});
