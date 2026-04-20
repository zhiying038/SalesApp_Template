import { FC, useEffect, useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedStyle, useAppTheme } from "@/theme";
import { $styles } from "@/theme/styles";
import { Text } from "../Text";
import { getSegmentedButtonBorderRadius, getSegmentedButtonColors } from "./utils";

type Props = {
  checked: boolean;
  hitSlop?: PressableProps["hitSlop"];
  icon?: string;
  label?: string;
  labelStyle?: StyleProp<ViewStyle>;
  segment?: "first" | "last";
  showSelectedCheck?: boolean;
  style?: StyleProp<ViewStyle>;
  uncheckedColor?: string;
  value: string;
  onPress?: (event: GestureResponderEvent) => void;
};

export const SegmentedButtonItem: FC<Props> = (props) => {
  const { checked, hitSlop, icon, label, labelStyle, segment, showSelectedCheck, onPress } = props;

  // =========== HOOKS
  const { theme, themed } = useAppTheme();

  const checkScale = useRef(new Animated.Value(0)).current;
  const showIcon = !icon ? false : label && checked ? !showSelectedCheck : true;
  const showCheckedIcon = checked && showSelectedCheck;

  const { backgroundColor, borderColor } = getSegmentedButtonColors({ checked, theme });
  const segmentBorderRadius = getSegmentedButtonBorderRadius({ segment });

  const iconSize = 16;
  const iconStyle = {
    marginRight: label ? 5 : showCheckedIcon ? 3 : 0,
    ...(label && {
      transform: [
        {
          scale: checkScale.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        },
      ],
    }),
  };

  const buttonStylesOverride = {
    borderColor,
    backgroundColor,
    ...segmentBorderRadius,
  };

  // ========== EFFECTS
  useEffect(() => {
    if (!showSelectedCheck) return;
    if (checked) {
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(checkScale, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [checked, checkScale, showSelectedCheck]);

  return (
    <View style={[buttonStylesOverride, themed($buttonStyle)]}>
      <Pressable
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityState={{ checked }}
        onPress={onPress}
      >
        <View style={themed($contentStyle)}>
          {showCheckedIcon ? (
            <Animated.View style={[iconStyle, { transform: [{ scale: checkScale }] }]}>
              <Ionicons name="checkmark" size={iconSize} color={theme.colors.text} />
            </Animated.View>
          ) : null}
          {showIcon ? (
            <Animated.View style={iconStyle}>
              <Ionicons name={icon as any} size={iconSize} color={theme.colors.text} />
            </Animated.View>
          ) : null}
          <Text
            size="xxs"
            weight="medium"
            selectable={false}
            numberOfLines={1}
            style={[$styles.textCenter, labelStyle]}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const $buttonStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: 76,
  borderStyle: "solid",
  borderRadius: spacing.xs,
  borderWidth: StyleSheet.hairlineWidth,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
});

const $contentStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",

  paddingHorizontal: spacing.sm,
});
