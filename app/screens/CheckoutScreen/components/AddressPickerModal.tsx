import { FC } from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BottomSheetModal, Text } from "@/components";
import type { CustomerAddress } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import { formatAddress } from "@/utils";

type Props = {
  visible: boolean;
  title: string;
  addresses: CustomerAddress[];
  selectedName?: string;
  onSelect: (address: CustomerAddress) => void;
  onClose: () => void;
};

export const AddressPickerModal: FC<Props> = ({
  visible,
  title,
  addresses,
  selectedName,
  onSelect,
  onClose,
}) => {
  const { themed, theme } = useAppTheme();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} snapPoints={["60%"]}>
      <Text size="sm" weight="medium">
        {title}
      </Text>

      {addresses.length === 0 ? (
        <Text size="xxs" style={$styles.dimText}>
          No addresses available
        </Text>
      ) : (
        <BottomSheetScrollView
          style={$styles.flex1}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
        >
          {addresses.map((address) => {
            const isSelected = address.Address === selectedName;
            return (
              <Pressable
                key={address.Address}
                onPress={() => onSelect(address)}
                style={themed([$row, isSelected && $rowSelected])}
              >
                <View style={$styles.flex1}>
                  <Text size="xxs" weight="medium" numberOfLines={1}>
                    {address.Address}
                    {address.IsDefault ? " (Default)" : ""}
                  </Text>
                  <Text size="xxs" style={$styles.dimText}>
                    {formatAddress(address) || "-"}
                  </Text>
                </View>
                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={isSelected ? theme.colors.tint : theme.colors.textDim}
                />
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      )}
    </BottomSheetModal>
  );
};

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
  paddingVertical: spacing.xxs,
});

const $row: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  borderRadius: spacing.xs,
  backgroundColor: colors.palette.neutral100,
});

const $rowSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
});
