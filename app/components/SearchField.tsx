import { useCallback } from "react";
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/context";
import { TextField, TextFieldAccessoryProps, TextFieldProps } from "./TextField";

interface SearchFieldProps extends Omit<TextFieldProps, "LeftAccessory" | "RightAccessory"> {
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function SearchField({ value, onChangeText, containerStyle, ...rest }: SearchFieldProps) {
  const { theme } = useAppTheme();

  const LeftAccessory = useCallback(
    ({ style }: TextFieldAccessoryProps) => (
      <View style={style}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textDim} />
      </View>
    ),
    [theme.colors.textDim],
  );

  const RightAccessory = useCallback(
    ({ style }: TextFieldAccessoryProps) =>
      value ? (
        <Pressable onPress={() => onChangeText("")} style={style}>
          <Ionicons name="close-circle" size={18} color={theme.colors.textDim} />
        </Pressable>
      ) : null,
    [value, onChangeText],
  );

  return (
    <TextField
      value={value}
      onChangeText={onChangeText}
      containerStyle={containerStyle}
      LeftAccessory={LeftAccessory}
      RightAccessory={RightAccessory}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      {...rest}
    />
  );
}
