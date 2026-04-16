import { FC, useEffect, useMemo, useState } from "react";
import { Alert, ViewStyle } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { KPIGrid } from "@/components";
import { Screen } from "@/components/Screen";
import type { MainTabScreenProps } from "@/navigators/navigationTypes";
import { api, DashboardSummary } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import { useHeader } from "@/utils/useHeader";

export const HomeScreen: FC<MainTabScreenProps<"Home">> = () => {
  const { themed } = useAppTheme();
  const isFocused = useIsFocused();

  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary[]>([]);

  const dailySalesSummary = useMemo(() => {
    if (summary.length === 0) return [];
    return summary.filter((x) => x.Type === "Daily" && x.Section === "Sales");
  }, [summary]);

  const monthlySalesSummary = useMemo(() => {
    if (summary.length === 0) return [];
    return summary.filter((x) => x.Type === "Monthly" && x.Section === "Sales");
  }, [summary]);

  const financeSummary = useMemo(() => {
    if (summary.length === 0) return [];
    return summary.filter((x) => x.Section === "Finance");
  }, [summary]);

  useHeader({
    title: "Home",
  });

  // ========== EVENTS
  const onGetSummary = async () => {
    const response = await api.getSummary();
    if (response.kind !== "ok") throw new Error(response.message);
    setSummary(response.summary);
  };

  const onInitialized = async () => {
    try {
      setIsLoading(true);
      await Promise.all([onGetSummary()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== EFFECTS
  useEffect(() => {
    if (!isFocused) return;
    onInitialized();
  }, [isFocused]);

  return (
    <Screen preset="scroll" contentContainerStyle={themed($container)}>
      <KPIGrid title="Daily Sales Report" data={dailySalesSummary} isLoading={isLoading} />

      <KPIGrid title="Monthly Sales Report" data={monthlySalesSummary} isLoading={isLoading} />

      <KPIGrid title="Opportunities & Finance" data={financeSummary} isLoading={isLoading} />
    </Screen>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
});
