import type { TextStyle, ViewStyle } from "react-native";
import type { ThemedStyle } from "@/theme/types";

export const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.md,
});

export const $infoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxs,
});

export const $labelCol: ThemedStyle<ViewStyle> = () => ({
  width: 72,
});

export const $modalTextInput: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.xs,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  color: colors.text,
  backgroundColor: colors.palette.neutral100,
  fontSize: 14,
});

export const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.xl,
});

export const $centered: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
};
