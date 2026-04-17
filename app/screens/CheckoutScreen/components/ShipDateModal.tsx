import { FC } from "react";
import { Pressable, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { addDays, format, startOfDay } from "date-fns";
import { BottomSheetModal, ModalActionBar, Text } from "@/components";
import type { CartItem } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { SHIP_DATE_FORMAT, SHIP_DATE_PRESETS } from "./constants";
import { $modalTextInput } from "./styles";

type Props = {
  item: CartItem | null;
  draft: string;
  isSaving: boolean;
  onDraftChange: (value: string) => void;
  onPickPreset: (offsetDays: number) => void;
  onClose: () => void;
  onSave: () => void;
};

export const ShipDateModal: FC<Props> = ({
  item,
  draft,
  isSaving,
  onDraftChange,
  onPickPreset,
  onClose,
  onSave,
}) => {
  const { themed, theme } = useAppTheme();

  return (
    <BottomSheetModal visible={item !== null} onClose={onClose}>
      <Text size="sm" weight="medium">
        Ship Date
      </Text>
      {item ? (
        <Text size="xxs" style={$styles.dimText} numberOfLines={2}>
          {item.ItemName} ({item.ItemCode})
        </Text>
      ) : null}

      <View style={themed($presetRow)}>
        {SHIP_DATE_PRESETS.map((preset) => {
          const presetValue = format(
            addDays(startOfDay(new Date()), preset.offsetDays),
            SHIP_DATE_FORMAT,
          );
          const isActive = draft === presetValue;
          return (
            <Pressable
              key={preset.label}
              onPress={() => onPickPreset(preset.offsetDays)}
              style={themed([$presetChip, isActive && $presetChipActive])}
              disabled={isSaving}
            >
              <Text
                size="xxs"
                weight="medium"
                style={themed(isActive ? $presetTextActive : $presetText)}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={draft}
        onChangeText={onDraftChange}
        editable={!isSaving}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.colors.textDim}
        style={themed($modalTextInput)}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={10}
      />

      <ModalActionBar
        onCancel={onClose}
        onSave={onSave}
        isSaving={isSaving}
        leading={
          <Pressable
            onPress={() => onDraftChange("")}
            hitSlop={8}
            disabled={isSaving || draft.length === 0}
          >
            <Text
              size="xxs"
              style={{
                color: draft.length === 0 ? theme.colors.textDim : theme.colors.error,
              }}
            >
              Clear
            </Text>
          </Pressable>
        }
      />
    </BottomSheetModal>
  );
};

const $presetRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xxs,
});

const $presetChip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
});

const $presetChipActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
});

const $presetText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $presetTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
});
