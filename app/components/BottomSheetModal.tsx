import { FC, ReactNode } from "react";
import { Modal, Pressable, View, ViewStyle } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export const BottomSheetModal: FC<Props> = ({ visible, onClose, children }) => {
  const { themed } = useAppTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView style={themed($backdrop)} behavior="padding">
        <Pressable style={$dismiss} onPress={onClose} />
        <View style={themed($sheet)}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const $backdrop: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "flex-end",
});

const $dismiss: ViewStyle = {
  flex: 1,
};

const $sheet: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
  gap: spacing.sm,
});
