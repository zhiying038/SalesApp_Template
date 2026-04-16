import { FC } from "react";
import { View, ViewStyle, TextStyle } from "react-native";
import { Screen, SkeletonText, Text } from "@/components";
import type { CatalogStackScreenProps } from "@/navigators";
import { ItemStock } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

const STAT_KEYS = ["OnHand", "IsCommited", "OnOrder", "Available"] as const;
type StatKey = (typeof STAT_KEYS)[number];

const STAT_LABELS: Record<StatKey, string> = {
  OnHand: "On Hand",
  IsCommited: "Committed",
  OnOrder: "On Order",
  Available: "Available",
};

const StockCard: FC<{ stock: ItemStock }> = ({ stock }) => {
  const { themed, theme } = useAppTheme();
  return (
    <View style={themed($card)}>
      <View style={{ gap: 2 }}>
        <Text weight="semiBold" size="sm">
          {stock.WhsName}
        </Text>
        <Text size="xxs" style={themed($dimText)}>
          {stock.WhsCode}
        </Text>
      </View>

      <View style={$statsGrid}>
        {STAT_KEYS.map((key, i) => {
          const isRight = i % 2 === 1;
          const color =
            key === "Available"
              ? stock.Available > 0
                ? theme.colors.palette.primary500
                : theme.colors.error
              : undefined;
          return (
            <View key={key} style={[themed($statCell), isRight && themed($rightCell)]}>
              <Text weight="bold" size="md" style={color ? { color } : undefined}>
                {stock[key]}
              </Text>
              <Text size="xxs" style={themed($dimText)}>
                {STAT_LABELS[key]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const SkeletonCard: FC = () => {
  const { themed } = useAppTheme();
  return (
    <View style={themed($card)}>
      <SkeletonText height={16} width="50%" />
      <SkeletonText height={13} width="35%" />
      <View style={$statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={themed($statCell)}>
            <SkeletonText height={20} width="60%" />
            <SkeletonText height={12} width="80%" />
          </View>
        ))}
      </View>
    </View>
  );
};

export const ItemStockScreen: FC<CatalogStackScreenProps<"ItemStock">> = ({
  route,
  navigation,
}) => {
  const { item, stocks = [] } = route.params;

  const { themed } = useAppTheme();

  useHeader(
    {
      title: "Stock",
      leftIcon: "caretLeft",
      onLeftPress: () => navigation.goBack(),
    },
    [],
  );

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

      {stocks === null
        ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        : stocks.map((stock) => <StockCard key={stock.WhsCode} stock={stock} />)}
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

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  marginBottom: spacing.md,
  gap: spacing.sm,
});

const $statsGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
};

const $statCell: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "50%",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.xs,
  gap: 2,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral300,
});

const $rightCell: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderLeftWidth: 1,
  borderLeftColor: colors.palette.neutral300,
});

const $dimText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});
