import { FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/theme";
import { $styles } from "@/theme/styles";
import { Divider } from "../Divider";
import { Flex } from "../Flex";
import { Text } from "../Text";

type Props = {
  currency?: string;
  discount?: number;
  style?: StyleProp<ViewStyle>;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
};

export const BreakdownSummary: FC<Props> = (props) => {
  const {
    currency = "MYR",
    discount = 0,
    style,
    subtotal = 0,
    taxAmount = 0,
    totalAmount = 0,
  } = props;

  // ========== HOOKS
  const { theme } = useAppTheme();

  // ========== VIEWS
  return (
    <View style={style}>
      <Flex.Row justify="between" align="center" style={$sheetRow}>
        <Text size="xxs" style={$styles.dimText}>
          Subtotal
        </Text>
        <Text size="xxs">
          {currency} {(subtotal ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>

      <Flex.Row justify="between" align="center" style={$sheetRow}>
        <Text size="xxs" style={$styles.dimText}>
          Discount
        </Text>
        <Text size="xxs" style={{ color: theme.colors.tint }}>
          -{currency} {(discount ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>

      <Flex.Row justify="between" align="center" style={$sheetRow}>
        <Text size="xxs" style={$styles.dimText}>
          Tax
        </Text>
        <Text size="xxs">
          {currency} {(taxAmount ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>

      <Divider verticalInset />

      <Flex.Row justify="between" align="center" style={$sheetRow}>
        <Text size="xs" weight="bold">
          Total
        </Text>
        <Text size="xs" weight="bold">
          {currency} {(totalAmount ?? 0).toFixed(2)}
        </Text>
      </Flex.Row>
    </View>
  );
};

const $sheetRow: ViewStyle = {
  paddingVertical: 2,
};
