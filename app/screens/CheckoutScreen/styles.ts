import type { ViewStyle } from "react-native";
import type { ThemedStyle } from "@/theme/types";

export const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  gap: spacing.md,
});

export const $labelCol: ThemedStyle<ViewStyle> = () => ({
  width: 72,
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
