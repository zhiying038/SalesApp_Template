import { FC } from "react";
import { GestureResponderEvent, StyleProp, TextStyle, View, ViewStyle } from "react-native";
import { $styles } from "@/theme/styles";
import { SegmentedButtonItem } from "./SegmentedButtonItem";

type ConditionalValue<T extends string = string> =
  | {
      value: T[];
      multiSelect: true;
      onValueChange: (value: T[]) => void;
    }
  | {
      value: T;
      multiSelect?: false;
      onValueChange: (value: T) => void;
    };

type Props<T extends string = string> = {
  buttons?: {
    icon?: string;
    label?: string;
    labelStyle?: StyleProp<TextStyle>;
    style?: StyleProp<ViewStyle>;
    value: T;
    onPress?: (event: GestureResponderEvent) => void;
  }[];
  style?: StyleProp<ViewStyle>;
} & ConditionalValue<T>;

export const SegmentedButtons: FC<Props> = (props) => {
  const { buttons = [], multiSelect, style, value, onValueChange } = props;

  return (
    <View style={[$styles.row, style]}>
      {buttons.map((item, i) => {
        const segment = i === 0 ? "first" : i === buttons.length - 1 ? "last" : undefined;

        const checked =
          multiSelect && Array.isArray(value) ? value.includes(item.value) : value === item.value;

        const onPress = (e: GestureResponderEvent) => {
          item.onPress?.(e);
          const nextValue =
            multiSelect && Array.isArray(value)
              ? checked
                ? value.filter((val) => item.value !== val)
                : [...value, item.value]
              : item.value;
          // @ts-expect-error: TS doesn't preserve types after destructuring, so the type isn't inferred correctly
          onValueChange(nextValue);
        };

        return (
          <SegmentedButtonItem
            {...item}
            key={i}
            checked={checked}
            segment={segment}
            style={item.style}
            labelStyle={item.labelStyle}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
};
