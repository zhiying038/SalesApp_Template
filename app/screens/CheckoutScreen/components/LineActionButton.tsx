import { ComponentProps, FC } from "react";
import { Pressable, TextStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IoniconName;
  iconEmpty: IoniconName;
  value?: string;
  placeholder: string;
  prefix?: string;
  numberOfLines?: number;
  onPress: () => void;
};

export const LineActionButton: FC<Props> = ({
  icon,
  iconEmpty,
  value,
  placeholder,
  prefix,
  numberOfLines = 1,
  onPress,
}) => {
  const { themed, theme } = useAppTheme();

  const hasValue = !!value && value.trim().length > 0;
  const label = hasValue ? `${prefix ?? ""}${value}` : placeholder;

  return (
    <Pressable
      onPress={onPress}
      style={themed($row)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={hasValue ? icon : iconEmpty}
        size={14}
        color={hasValue ? theme.colors.tint : theme.colors.textDim}
      />
      <Text size="xxs" numberOfLines={numberOfLines} style={themed(hasValue ? $text : $placeholder)}>
        {label}
      </Text>
    </Pressable>
  );
};

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  marginTop: spacing.xs,
});

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.text,
});

const $placeholder: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.textDim,
});
