import { FC } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export interface ColProps extends ViewProps {
  flex?: "1" | "auto" | "initial" | "none";
  grow?: "grow" | "none";
  align?: "auto" | "start" | "end" | "center" | "stretch";
  shrink?: "shrink" | "none";
  style?: StyleProp<ViewStyle>;
}

const Col: FC<ColProps> = (props) => {
  const { align, children, flex, grow, shrink, style, ...restProps } = props;

  const colStyles: StyleProp<ViewStyle> = [
    align === "end" && styles.selfEnd,
    align === "auto" && styles.selfAuto,
    align === "start" && styles.selfStart,
    align === "center" && styles.selfCenter,
    align === "stretch" && styles.selfStretch,
    flex === "1" && styles.flex1,
    flex === "auto" && styles.flexAuto,
    flex === "none" && styles.flexNone,
    flex === "initial" && styles.flexInitial,
    grow === "grow" && styles.flexGrow,
    grow === "none" && styles.flexGrow0,
    shrink === "shrink" && styles.flexShrink,
    shrink === "none" && styles.flexShrink0,
    style, // Merge any additional styles passed as props
  ];

  // ========== VIEWS
  return (
    <View style={colStyles} {...restProps}>
      {children}
    </View>
  );
};

export default Col;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  flexAuto: {
    flexGrow: 1,
    flexShrink: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexGrow0: {
    flexGrow: 0,
  },
  flexInitial: {
    flexBasis: "auto",
    flexGrow: 0,
    flexShrink: 1,
  },
  flexNone: {
    flex: 0,
  },
  flexShrink: {
    flexShrink: 1,
  },
  flexShrink0: {
    flexShrink: 0,
  },
  selfAuto: {
    alignSelf: "auto",
  },
  selfCenter: {
    alignSelf: "center",
  },
  selfEnd: {
    alignSelf: "flex-end",
  },
  selfStart: {
    alignSelf: "flex-start",
  },
  selfStretch: {
    alignSelf: "stretch",
  },
});
