import { TextStyle, ViewStyle } from "react-native";
import { colors } from "./colors";

/* Use this file to define styles that are used in multiple places in your app. */
export const $styles = {
  row: { flexDirection: "row" } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  flexWrap: { flexWrap: "wrap" } as ViewStyle,
  toggleInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  } as ViewStyle,
  separator: {
    height: 12,
  } as ViewStyle,
  dimText: {
    color: colors.textDim,
  } as TextStyle,
};
