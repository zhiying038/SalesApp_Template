import { FC, useEffect, useState } from "react";
import { Platform, Pressable, ViewStyle } from "react-native";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { addDays, format, startOfDay } from "date-fns";
import { BottomSheetModal, Button, Chip, Flex, Text } from "@/components";
import type { CartItem } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { parseDate } from "@/utils";

export const SHIP_DATE_FORMAT = "yyyy-MM-dd";
export const SHIP_DATE_DISPLAY_FORMAT = "EEE, dd MMM yyyy";

export const SHIP_DATE_PRESETS = [
  { label: "Today", offsetDays: 0 },
  { label: "Tomorrow", offsetDays: 1 },
  { label: "+3d", offsetDays: 3 },
  { label: "+7d", offsetDays: 7 },
  { label: "+14d", offsetDays: 14 },
  { label: "+30d", offsetDays: 30 },
];

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
  const [isIosPickerOpen, setIsIosPickerOpen] = useState(false);

  useEffect(() => {
    if (item === null) setIsIosPickerOpen(false);
  }, [item]);

  const selectedDate = parseDate(draft);
  const today = startOfDay(new Date());
  const pickerValue = selectedDate ?? today;

  const commitDate = (date: Date) => {
    onDraftChange(format(startOfDay(date), SHIP_DATE_FORMAT));
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "set" && date) commitDate(date);
  };

  const openPicker = () => {
    if (isSaving) return;
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode: "date",
        minimumDate: today,
        onChange: onDateChange,
      });
      return;
    }
    setIsIosPickerOpen((prev) => !prev);
  };

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

      <Flex.Row wrap gutter={4}>
        {SHIP_DATE_PRESETS.map((preset, i) => {
          const presetValue = format(
            addDays(startOfDay(new Date()), preset.offsetDays),
            SHIP_DATE_FORMAT,
          );
          return (
            <Flex.Col key={i}>
              <Chip
                disabled={isSaving}
                selected={draft === presetValue}
                onPress={() => onPickPreset(preset.offsetDays)}
              >
                {preset.label}
              </Chip>
            </Flex.Col>
          );
        })}
      </Flex.Row>

      <Pressable
        onPress={openPicker}
        disabled={isSaving}
        style={themed([$dateField, isIosPickerOpen && $dateFieldActive])}
      >
        <Text
          size="xxs"
          style={{
            color: selectedDate ? theme.colors.text : theme.colors.textDim,
          }}
        >
          {selectedDate ? format(selectedDate, SHIP_DATE_DISPLAY_FORMAT) : "Select a date"}
        </Text>
      </Pressable>

      {Platform.OS === "ios" && isIosPickerOpen ? (
        <DateTimePicker
          mode="date"
          display="inline"
          minimumDate={today}
          value={pickerValue}
          onValueChange={(_e, d) => commitDate(d)}
          themeVariant={theme.isDark ? "dark" : "light"}
        />
      ) : null}

      <Flex.Row align="center" justify="between">
        <Flex.Col flex="1">
          <Pressable
            hitSlop={8}
            onPress={() => onDraftChange("")}
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
        </Flex.Col>
        <Flex.Row gutter={8}>
          <Flex.Col>
            <Button preset="default" disabled={isSaving} onPress={onClose}>
              Cancel
            </Button>
          </Flex.Col>
          <Flex.Col>
            <Button preset="filled" disabled={isSaving} onPress={onSave}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Flex.Col>
        </Flex.Row>
      </Flex.Row>
    </BottomSheetModal>
  );
};

const $dateField: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.xs,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.palette.neutral100,
});

const $dateFieldActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
});
