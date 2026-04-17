import { FC } from "react";
import { ViewStyle } from "react-native";
import { Flex, SectionCard, Text } from "@/components";
import { Divider } from "@/components/Divider";
import type { Cart } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";

type Props = {
  cart: Cart;
};

export const SummaryCard: FC<Props> = ({ cart }) => {
  const { theme } = useAppTheme();
  const currency = cart.Currency ?? "";

  return (
    <SectionCard>
      <Flex.Row justify="between" align="center" style={$summaryRow}>
        <Text size="xxs" style={$styles.dimText}>
          Subtotal
        </Text>
        <Text size="xxs">
          {currency} {(cart.TotalBeforeDiscount ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>
      <Flex.Row justify="between" align="center" style={$summaryRow}>
        <Text size="xxs" style={$styles.dimText}>
          Discount
        </Text>
        <Text size="xxs" style={{ color: theme.colors.tint }}>
          -{currency} {(cart.BPDiscAmount ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>
      <Flex.Row justify="between" align="center" style={$summaryRow}>
        <Text size="xxs" style={$styles.dimText}>
          Tax
        </Text>
        <Text size="xxs">
          {currency} {(cart.TotalTaxAmount ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>

      <Divider verticalInset />

      <Flex.Row justify="between" align="center" style={$summaryRow}>
        <Text size="sm" weight="bold">
          Total
        </Text>
        <Text size="sm" weight="bold">
          {currency} {(cart.DocTotal ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>
    </SectionCard>
  );
};

const $summaryRow: ViewStyle = {
  paddingVertical: 2,
};
