import { FC } from "react";
import { View, ViewStyle } from "react-native";
import { Flex, SectionCard, Text } from "@/components";
import type { CartItem } from "@/services/api";
import { ThemedStyle, useAppTheme } from "@/theme";
import { $styles } from "@/theme/styles";
import { LineActionButton } from ".";
import { formatShipDate } from "../helpers";

type Props = {
  items: CartItem[];
  currency: string;
  onEditShipDate: (item: CartItem) => void;
  onEditRemarks: (item: CartItem) => void;
};

export const ItemsCard: FC<Props> = ({ items, currency, onEditShipDate, onEditRemarks }) => {
  const trailing = `${items.length} ${items.length === 1 ? "item" : "items"}`;
  const { themed, theme } = useAppTheme();

  return (
    <SectionCard title="Items" trailing={trailing}>
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

          <LineActionButton
            icon="calendar"
            iconEmpty="calendar-outline"
            prefix="Ship: "
            placeholder="Set ship date"
            value={formatShipDate(item.ShipDate)}
            onPress={() => onEditShipDate(item)}
          />

          <LineActionButton
            icon="chatbubble-ellipses-outline"
            iconEmpty="add-circle-outline"
            value={item.Remarks ?? undefined}
            placeholder="Add remarks"
            numberOfLines={2}
            onPress={() => onEditRemarks(item)}
          />
        </View>
      ))}
    </SectionCard>
  );
};

const $itemRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});
