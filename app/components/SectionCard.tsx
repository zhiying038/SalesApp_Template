import { FC, ReactNode } from "react";
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";
import { Divider } from "@/components/Divider";
import { Flex } from "@/components/Flex";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

type Props = {
  title?: string;
  trailing?: ReactNode;
  isLoading?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const SectionCard: FC<Props> = ({ title, trailing, isLoading, children, style }) => {
  const { themed, theme } = useAppTheme();

  const header = title ? (
    <>
      {trailing !== undefined ? (
        <Flex.Row justify="between" align="center">
          <Text size="xs" weight="medium">
            {title}
          </Text>
          {typeof trailing === "string" ? (
            <Text size="xxs" style={$styles.dimText}>
              {trailing}
            </Text>
          ) : (
            trailing
          )}
        </Flex.Row>
      ) : (
        <Text size="xs" weight="medium">
          {title}
        </Text>
      )}
      <Divider verticalInset />
    </>
  ) : null;

  return (
    <View style={[themed($card), style]}>
      {header}
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.tint} />
      ) : (
        children
      )}
    </View>
  );
};

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.md,
  gap: spacing.xxs,
});
