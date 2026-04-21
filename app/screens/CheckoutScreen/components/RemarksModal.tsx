import { FC } from "react";
import { TextStyle, ViewStyle } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheetModal, ModalActionBar, Text } from "@/components";
import type { CartItem } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

const MAX_LENGTH = 500;

type Props = {
  item: CartItem | null;
  draft: string;
  isSaving: boolean;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export const RemarksModal: FC<Props> = ({
  item,
  draft,
  isSaving,
  onDraftChange,
  onClose,
  onSave,
}) => {
  const { themed, theme } = useAppTheme();

  return (
    <BottomSheetModal visible={item !== null} onClose={onClose}>
      <Text size="sm" weight="medium">
        Line Remarks
      </Text>
      {item ? (
        <Text size="xxs" style={$styles.dimText} numberOfLines={2}>
          {item.ItemName} ({item.ItemCode})
        </Text>
      ) : null}

      <BottomSheetTextInput
        multiline
        autoFocus
        value={draft}
        onChangeText={onDraftChange}
        editable={!isSaving}
        placeholder="Enter remarks for this line..."
        placeholderTextColor={theme.colors.textDim}
        style={themed($input)}
        maxLength={MAX_LENGTH}
      />

      <ModalActionBar
        onCancel={onClose}
        onSave={onSave}
        isSaving={isSaving}
        leading={
          <Text size="xxs" style={$styles.dimText}>
            {draft.length}/{MAX_LENGTH}
          </Text>
        }
      />
    </BottomSheetModal>
  );
};

const $input: ThemedStyle<TextStyle & ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 96,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.xs,
  padding: spacing.sm,
  color: colors.text,
  backgroundColor: colors.palette.neutral100,
  textAlignVertical: "top",
  fontSize: 14,
});
