import { ViewStyle } from "react-native";
import { Theme } from "@/theme";

type BaseProps = {
  checked: boolean;
  disabled?: boolean;
  theme: Theme;
};

const getSegmentedButtonBackgroundColor = ({ checked, theme }: BaseProps) => {
  if (checked) {
    return theme.colors.tint;
  } else {
    return theme.colors.palette.neutral200;
  }
};

const getSegmentedButtonBorderColor = ({ checked, theme, disabled }: BaseProps) => {
  if (disabled) {
    return theme.colors.textDim;
  }
  if (checked) {
    return theme.colors.palette.primary100;
  }
  return theme.colors.border;
};

export const getSegmentedButtonColors = ({ theme, disabled, checked }: BaseProps) => {
  const backgroundColor = getSegmentedButtonBackgroundColor({ theme, checked });
  const borderColor = getSegmentedButtonBorderColor({ theme, disabled, checked });

  return { backgroundColor, borderColor };
};

export const getSegmentedButtonBorderRadius = ({
  segment,
}: {
  segment?: "first" | "last";
}): ViewStyle => {
  if (segment === "first") {
    return {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderEndWidth: 0,
    };
  } else if (segment === "last") {
    return {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    };
  } else {
    return {
      borderRadius: 0,
      borderEndWidth: 0,
    };
  }
};
