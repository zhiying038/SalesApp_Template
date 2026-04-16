import { FC, useCallback, useEffect, useState } from "react";
import { Pressable, StyleProp, TextInput, TextStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedStyle, useAppTheme } from "@/theme";
import { Flex } from "./Flex";

type Props = {
  inputStyle?: StyleProp<TextStyle>;
  value?: number;
  onChange?: (quantity: number) => void;
};

export const QuantityInput: FC<Props> = (props) => {
  const { inputStyle, value, onChange } = props;

  const { themed, theme } = useAppTheme();

  // ========== STATES
  const [quantity, setQuantity] = useState(1);

  // ========== EVENTS
  const handleQuantityChange = useCallback((text: string) => {
    const num = parseInt(text, 10);
    const finalNum = Number.isNaN(num) || num < 0 ? 0 : num;
    setQuantity(finalNum);
    onChange?.(finalNum);
  }, []);

  const increment = useCallback(() => {
    const num = quantity + 1;
    setQuantity(num);
    onChange?.(num);
  }, [quantity]);

  const decrement = useCallback(() => {
    const num = Math.max(0, quantity - 1);
    setQuantity(num);
    onChange?.(num);
  }, [quantity]);

  // ========== EFFECTS
  useEffect(() => {
    setQuantity(value ?? 1);
  }, [value]);

  return (
    <Flex.Row justify="center" gutter={4} align="center">
      <Flex.Col>
        <Pressable style={themed($qtyButton)} onPress={decrement}>
          <Ionicons name="remove" size={10} color={theme.colors.text} />
        </Pressable>
      </Flex.Col>

      <Flex.Col>
        <TextInput
          selectTextOnFocus
          value={String(quantity)}
          keyboardType="number-pad"
          style={[themed($inputContainer), inputStyle]}
          onChangeText={handleQuantityChange}
        />
      </Flex.Col>

      <Flex.Col>
        <Pressable style={themed($qtyButton)} onPress={increment}>
          <Ionicons name="add" size={10} color={theme.colors.text} />
        </Pressable>
      </Flex.Col>
    </Flex.Row>
  );
};

const $qtyButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 25,
  height: 25,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
});

const $inputContainer: ThemedStyle<TextStyle> = ({ colors }) => ({
  width: 64,
  height: 40,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.palette.neutral400,
  backgroundColor: colors.palette.neutral100,
  textAlign: "center",
  fontSize: 16,
  color: colors.text,
});
