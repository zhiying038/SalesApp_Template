import { Dimensions, TextStyle, View, ViewStyle } from "react-native";
import { Skeleton } from "moti/skeleton";
import { ThemedStyle, useAppTheme } from "@/theme";
import { Divider } from "./Divider";
import { SkeletonText } from "./Skeleton";
import { Text } from "./Text";

type KpiItem = {
  Title: string;
  Value: string;
};

type KPIGridProps = {
  title: string;
  data: KpiItem[];
  isLoading?: boolean;
  skeletonCount?: number;
};

const NUM_COLUMNS = 2;
const GAP = 12;
const H_PADDING = 24;

const ITEM_WIDTH = (Dimensions.get("window").width - H_PADDING * 2 - GAP) / NUM_COLUMNS;

const KPISkeletonItem = () => {
  const { themed } = useAppTheme();

  return (
    <Skeleton>
      <View style={[themed($kpiContainer), $skeletonItem]}>
        <SkeletonText height={20} width="60%" />
        <SkeletonText width="40%" height={16} />
      </View>
    </Skeleton>
  );
};

export const KPIGrid: React.FC<KPIGridProps> = (props) => {
  const { data, title, isLoading = false, skeletonCount = 6 } = props;

  const { themed } = useAppTheme();

  return (
    <View style={themed($container)}>
      <Text size="xs" style={themed($chartTitle)}>
        {title}
      </Text>
      <Divider verticalInset />
      <View style={$grid}>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => <KPISkeletonItem key={index} />)
          : data.map((item, index) => (
              <View key={index} style={themed($kpiContainer)}>
                <Text size="xxs" weight="normal" numberOfLines={2}>
                  {item.Title}
                </Text>
                <Text size="xs" weight="bold" style={$kpiValue}>
                  {item.Value}
                </Text>
              </View>
            ))}
      </View>
    </View>
  );
};

const $grid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: GAP,
};

const $kpiValue: TextStyle = {
  textAlign: "right",
  marginTop: "auto",
};

const $chartTitle: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
});

const $kpiContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 10,
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  minHeight: 50,
  width: ITEM_WIDTH,
});

const $skeletonItem: ViewStyle = {
  justifyContent: "space-between",
  gap: 8,
};

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});
