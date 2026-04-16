import { FC } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { ThemedStyle, useAppTheme } from "@/theme";

export interface DividerProps extends ViewProps {
  bold?: boolean;
  color?: string;
  horizontalInset?: boolean;
  leftInset?: boolean;
  style?: StyleProp<ViewStyle>;
  verticalInset?: boolean;
}

export const Divider: FC<DividerProps> = (props) => {
  const {
    bold = false,
    color,
    horizontalInset = false,
    leftInset = false,
    style,
    verticalInset = false,
    ...restProps
  } = props;

  // ========== HOOKS
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  // ========== VARIABLES
  const $styles: StyleProp<ViewStyle> = [
    { backgroundColor: color ?? colors.separator, height: bold ? 2 : StyleSheet.hairlineWidth },
    verticalInset && themed($verticalInset),
    horizontalInset && themed($horizontalInset),
    leftInset && themed($leftInset),
    style,
  ];

  // ========== VIEWS
  return <View style={$styles} {...restProps} />;
};

const $horizontalInset: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.md,
});

const $verticalInset: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
});

const $leftInset: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.md,
});
