import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { ItemGroup } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { Text } from "./Text";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHOW_MORE_COUNT = 6;

type FilterCategory = "itemGroup";

const CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: "itemGroup", label: "Item Group" },
];

export interface CatalogFilters {
  groups: string[];
}

interface CatalogFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: CatalogFilters) => void;
  initialFilters: CatalogFilters;
  itemGroups: ItemGroup[];
}

export const CatalogFilterSheet: FC<CatalogFilterSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  itemGroups,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("itemGroup");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialFilters.groups);
  const [showAllGroups, setShowAllGroups] = useState(false);

  const { themed } = useAppTheme();

  // Sync local state whenever the sheet opens
  useEffect(() => {
    if (visible) {
      setSelectedGroups(initialFilters.groups);
      setActiveCategory("itemGroup");
      setShowAllGroups(false);
    }
  }, [visible]);

  const visibleGroups = useMemo(
    () => (showAllGroups ? itemGroups : itemGroups.slice(0, SHOW_MORE_COUNT)),
    [itemGroups, showAllGroups],
  );

  const toggleGroup = useCallback((group: string) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  }, []);

  const handleReset = useCallback(() => {
    setSelectedGroups([]);
    setShowAllGroups(false);
  }, []);

  const handleApply = useCallback(() => {
    onApply({ groups: selectedGroups });
    onClose();
  }, [selectedGroups, onApply, onClose]);

  const hasActiveFilters = selectedGroups.length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={$overlay}>
        <Pressable style={$backdrop} onPress={onClose} />

        <View style={themed($sheet)}>
          {/* Header */}
          <View style={themed($header)}>
            <Text text="Filter" size="md" weight="semiBold" />
            {hasActiveFilters && (
              <Pressable onPress={handleReset}>
                <Text text="Clear All" size="xs" style={themed($clearText)} />
              </Pressable>
            )}
          </View>

          {/* Body */}
          <View style={$body}>
            {/* Left sidebar */}
            <View style={themed($sidebar)}>
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setActiveCategory(cat.key)}
                    style={[themed($categoryItem), isActive && themed($categoryItemActive)]}
                  >
                    <Text
                      text={cat.label}
                      size="xs"
                      style={[themed($categoryText), isActive && themed($categoryTextActive)]}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Right content */}
            <ScrollView
              style={themed($content)}
              contentContainerStyle={themed($contentInner)}
              showsVerticalScrollIndicator={false}
            >
              {activeCategory === "itemGroup" && (
                <>
                  <Text
                    text="Item Group"
                    size="sm"
                    weight="semiBold"
                    style={themed($sectionTitle)}
                  />
                  <View style={$chips}>
                    {visibleGroups.map((group) => {
                      const isSelected = selectedGroups.includes(group.ItmsGrpNam);
                      return (
                        <Pressable
                          key={group.ItmsGrpCod}
                          onPress={() => toggleGroup(group.ItmsGrpNam)}
                          style={[themed($chip), isSelected && themed($chipSelected)]}
                        >
                          <Text
                            size="xs"
                            numberOfLines={2}
                            text={group.ItmsGrpNam}
                            style={[themed($chipText), isSelected && themed($chipTextSelected)]}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                  {itemGroups.length > SHOW_MORE_COUNT && (
                    <Pressable onPress={() => setShowAllGroups((prev) => !prev)} style={$showMore}>
                      <Text
                        text={showAllGroups ? "Show Less ∧" : "Show More ∨"}
                        size="xs"
                        style={themed($showMoreText)}
                      />
                    </Pressable>
                  )}
                </>
              )}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={themed($footer)}>
            <Pressable style={themed($resetButton)} onPress={handleReset}>
              <Text text="Reset" size="sm" weight="medium" style={themed($resetText)} />
            </Pressable>
            <Pressable style={themed($applyButton)} onPress={handleApply}>
              <Text text="Apply" size="sm" weight="medium" style={$applyText} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const $overlay: ViewStyle = {
  flex: 1,
  justifyContent: "flex-end",
};

const $backdrop: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.45)",
};

const $sheet: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: SCREEN_HEIGHT * 0.78,
  backgroundColor: colors.background,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  overflow: "hidden",
});

const $header: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  backgroundColor: colors.background,
});

const $clearText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $body: ViewStyle = {
  flex: 1,
  flexDirection: "row",
};

const $sidebar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 90,
  backgroundColor: colors.palette.neutral200,
  borderRightWidth: 1,
  borderRightColor: colors.separator,
});

const $categoryItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xs,
  borderLeftWidth: 3,
  borderLeftColor: "transparent",
});

const $categoryItemActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderLeftColor: colors.tint,
  backgroundColor: colors.palette.neutral100,
});

const $categoryText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
});

const $categoryTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600",
});

const $content: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral100,
});

const $contentInner: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  paddingBottom: spacing.xl,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $chips: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
};

const $chip: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 4,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.palette.neutral100,
  maxWidth: "47%",
});

const $chipSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.palette.primary100,
});

const $chipText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $chipTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600",
});

const $showMore: ViewStyle = {
  alignSelf: "center",
  marginTop: 12,
};

const $showMoreText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $footer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  padding: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  backgroundColor: colors.background,
});

const $resetButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 48,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.sm,
});

const $resetText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $applyButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 48,
  borderRadius: 4,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.tint,
  paddingHorizontal: spacing.sm,
});

const $applyText: TextStyle = {
  color: "#FFFFFF",
};
