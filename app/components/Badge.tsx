import { StyleProp, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { Text } from "./Text";

interface BadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, style }: BadgeProps) {
  const { themed } = useAppTheme();
  return (
    <View style={[themed($container), style]}>
      <Text size="xxs" style={themed($text)} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  borderRadius: 999,
  backgroundColor: colors.palette.neutral200,
});

const $text: ThemedStyle<ViewStyle> = ({ colors }) => ({
  color: colors.palette.neutral600,
});
