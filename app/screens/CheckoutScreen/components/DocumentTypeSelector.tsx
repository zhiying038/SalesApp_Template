import { FC } from "react";
import { Pressable, TextStyle, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Flex, SectionCard, Text } from "@/components";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { DOCUMENT_TYPE_OPTIONS, type DocumentType } from "../constants";

type Props = {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
};

export const DocumentTypeSelector: FC<Props> = ({ value, onChange }) => {
  const { themed, theme } = useAppTheme();

  return (
    <SectionCard title="Document Type">
      <Flex.Row style={themed($segmentedControl)}>
        {DOCUMENT_TYPE_OPTIONS.map((option) => {
          const isActive = option.value === value;
          return (
            <Flex.Col flex="1" key={option.value}>
              <Pressable
                onPress={() => onChange(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={themed([$segmentItem, isActive && $segmentItemActive])}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={isActive ? theme.colors.palette.neutral100 : theme.colors.text}
                />
                <Text
                  size="xxs"
                  weight="medium"
                  style={themed([$segmentLabel, isActive && $segmentLabelActive])}
                >
                  {option.label}
                </Text>
              </Pressable>
            </Flex.Col>
          );
        })}
      </Flex.Row>
    </SectionCard>
  );
};

const $segmentedControl: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: spacing.xs,
  padding: 2,
  gap: 2,
});

const $segmentItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xxs,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: spacing.xxs,
});

const $segmentItemActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
});

const $segmentLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $segmentLabelActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
});
