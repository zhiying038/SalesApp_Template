import { Children, cloneElement, FC } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import isArray from "lodash/isArray";
import isNil from "lodash/isNil";

type RowGutter = 0 | 4 | 8 | 16 | 24 | 32 | 40 | 48;

export interface RowProps extends ViewProps {
  align?: "stretch" | "start" | "center" | "end" | "baseline";
  direction?: "col" | "row";
  gutter?: RowGutter | [RowGutter, RowGutter];
  justify?: "start" | "end" | "center" | "around" | "between" | "evenly";
  reverse?: boolean;
  style?: StyleProp<ViewStyle>;
  wrap?: boolean;
}

const Row: FC<RowProps> = (props) => {
  const {
    align = "start",
    children,
    direction = "row",
    gutter,
    justify = "start",
    reverse = false,
    style,
    wrap = false,
    ...restProps
  } = props;

  // ================= HELPERS
  const getStyle = (isParent?: boolean): StyleProp<ViewStyle> => {
    if (isNil(gutter)) return {};
    if (isArray(gutter)) {
      const [horizontal, vertical] = gutter;
      return isParent
        ? {
            marginLeft: -horizontal,
            marginRight: -horizontal,
            marginTop: -vertical,
            marginBottom: -vertical,
          }
        : {
            paddingLeft: horizontal,
            paddingRight: horizontal,
            paddingTop: vertical,
            paddingBottom: vertical,
          };
    }
    if (direction === "col") {
      return isParent
        ? {
            marginTop: -gutter,
            marginBottom: -gutter,
          }
        : { paddingTop: gutter, paddingBottom: gutter };
    }
    return isParent
      ? {
          marginLeft: -gutter,
          marginRight: -gutter,
        }
      : {
          paddingLeft: gutter,
          paddingRight: gutter,
        };
  };

  const containerStyles: StyleProp<ViewStyle> = [
    styles.flex,
    direction === "row" ? styles.row : styles.column,
    reverse && direction === "row" ? styles.rowReverse : {},
    reverse && direction === "col" ? styles.columnReverse : {},
    wrap ? styles.wrap : styles.noWrap,
    styles[`justify_${justify}`],
    styles[`align_${align}`],
    getStyle(true),
    style,
  ];

  // ========== VIEWS
  return (
    <View style={containerStyles} {...restProps}>
      {Children.map(children, (child: any) =>
        child && typeof child !== "boolean"
          ? cloneElement(child, { style: [getStyle(false), child.props.style] })
          : null,
      )}
    </View>
  );
};

export default Row;

const styles = StyleSheet.create({
  align_baseline: {
    alignItems: "baseline",
  },
  align_center: {
    alignItems: "center",
  },
  align_end: {
    alignItems: "flex-end",
  },
  align_start: {
    alignItems: "flex-start",
  },
  align_stretch: {
    alignItems: "stretch",
  },
  column: {
    flexDirection: "column",
  },
  columnReverse: {
    flexDirection: "column-reverse",
  },
  flex: {
    display: "flex",
  },
  justify_around: {
    justifyContent: "space-around",
  },
  justify_between: {
    justifyContent: "space-between",
  },
  justify_center: {
    justifyContent: "center",
  },
  justify_end: {
    justifyContent: "flex-end",
  },
  justify_evenly: {
    justifyContent: "space-evenly",
  },
  justify_start: {
    justifyContent: "flex-start",
  },
  noWrap: {
    flexWrap: "nowrap",
  },
  row: {
    flexDirection: "row",
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  wrap: {
    flexWrap: "wrap",
    rowGap: 8,
  },
});
