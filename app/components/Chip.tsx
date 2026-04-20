import { FC, ReactNode } from "react";
import {
  Animated,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedStyle, useAppTheme } from "@/theme";
import { Text } from "./Text";

type Props = {
  children: ReactNode;
  closeIcon?: typeof Ionicons;
  disabled?: boolean;
  hitSlop?: PressableProps["hitSlop"];
  selected?: boolean;
  selectedColor?: string;
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  onClose?: () => void;
  onPress?: (e: GestureResponderEvent) => void;
};

export const Chip: FC<Props> = (props) => {
  const {
    children,
    closeIcon,
    disabled = false,
    hitSlop,
    selected = false,
    style,
    onClose,
    onPress,
  } = props;

  const { themed, theme } = useAppTheme();

  return (
    <Animated.View style={[themed($container), selected && themed($active), style]}>
      <Pressable hitSlop={hitSlop} onPress={onPress}>
        <View style={themed($content)}>
          <Text
            size="xxs"
            selectable={false}
            numberOfLines={1}
            weight="medium"
            style={themed(selected ? $presetTextActive : $presetText)}
          >
            {children}
          </Text>
        </View>
      </Pressable>
      {onClose ? (
        <View style={themed($closeButton)}>
          <Pressable disabled={disabled} accessibilityRole="button" onPress={onClose}>
            <View>
              {closeIcon ? (
                <Ionicons size={16} name={closeIcon as any} color={theme.colors.text} />
              ) : (
                <Ionicons size={16} name="close-outline" color={theme.colors.text} />
              )}
            </View>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderColor: colors.separator,
  borderWidth: StyleSheet.hairlineWidth,
  borderStyle: "solid",
  flexDirection: Platform.select({ default: "column", web: "row" }),
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: spacing.xs,
  backgroundColor: colors.palette.neutral100,
});

const $content: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
});

const $closeButton: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  right: 0,
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const $active: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
});

const $presetText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $presetTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
});
