import { FC, ReactNode, useEffect, useRef } from "react";
import { ViewStyle } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal as GorhomBottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children?: ReactNode;
};

export const BottomSheetModal: FC<Props> = ({ visible, onClose, snapPoints, children }) => {
  const { themed, theme } = useAppTheme();
  const ref = useRef<GorhomBottomSheetModal>(null);

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      opacity={0.4}
    />
  );

  return (
    <GorhomBottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: theme.colors.palette.neutral300 }}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
    >
      <BottomSheetView style={themed(snapPoints ? $sheetFlex : $sheet)}>{children}</BottomSheetView>
    </GorhomBottomSheetModal>
  );
};

const $sheet: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
  gap: spacing.sm,
});

const $sheetFlex: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
  gap: spacing.sm,
});
