import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Screens from "@/screens";
import { useAppTheme } from "@/theme/context";
import type { CatalogStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<CatalogStackParamList>();

export function CatalogNavigator() {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="CatalogList" component={Screens.CatalogScreen} />
      <Stack.Screen name="ItemDetail" component={Screens.ItemDetailScreen} />
      <Stack.Screen name="ItemStock" component={Screens.ItemStockScreen} />
      <Stack.Screen name="ItemPricing" component={Screens.ItemPricingScreen} />
    </Stack.Navigator>
  );
}
