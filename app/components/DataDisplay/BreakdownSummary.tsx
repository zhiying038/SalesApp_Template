import { FC } from "react";
import { Modal, Pressable, View, ViewStyle } from "react-native";
import { ThemedStyle, useAppTheme } from "@/theme";
import { $styles } from "@/theme/styles";
import { Divider } from "../Divider";
import { Flex } from "../Flex";
import { Text } from "../Text";

type Props = {
  currency?: string;
  discount?: number;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  visible?: boolean;
  onClose?: () => void;
};

export const BreakdownSummary: FC<Props> = (props) => {
  const {
    currency = "MYR",
    discount = 0,
    subtotal = 0,
    taxAmount = 0,
    totalAmount = 0,
    visible = false,
    onClose,
  } = props;

  // ========== HOOKS
  const { themed, theme } = useAppTheme();

  // ========== EVENTS
  const closeBreakdown = () => {
    onClose?.();
  };
  // ========== VIEWS
  return (
    <Modal transparent visible={visible} statusBarTranslucent onRequestClose={closeBreakdown}>
      <Pressable style={themed($backdrop)} onPress={closeBreakdown} />
      <View style={themed($sheet)}>
        <Flex.Row justify="between" align="center" style={$sheetRow}>
          <Text size="xs" style={$styles.dimText}>
            Subtotal
          </Text>
          <Text size="xs">
            {currency} {(subtotal ?? 0).toFixed(2)}
          </Text>
        </Flex.Row>

        <Flex.Row justify="between" align="center" style={$sheetRow}>
          <Text size="xs" style={$styles.dimText}>
            Discount
          </Text>
          <Text size="xs" style={{ color: theme.colors.tint }}>
            -{currency} {(discount ?? 0).toFixed(2)}
          </Text>
        </Flex.Row>

        <Flex.Row justify="between" align="center" style={$sheetRow}>
          <Text size="xs" style={$styles.dimText}>
            Tax
          </Text>
          <Text size="xs">
            {currency} {(taxAmount ?? 0).toFixed(2)}
          </Text>
        </Flex.Row>

        <Divider verticalInset />

        <Flex.Row justify="between" align="center" style={$sheetRow}>
          <Text size="sm" weight="bold">
            Total
          </Text>
          <Text size="sm" weight="bold">
            {currency} {(totalAmount ?? 0).toFixed(2)}
          </Text>
        </Flex.Row>
      </View>
    </Modal>
  );
};

const $sheet: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: colors.background,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  paddingTop: spacing.sm,
  gap: spacing.xs,
});

const $sheetRow: ViewStyle = {
  paddingVertical: 2,
};

const $backdrop: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
});
