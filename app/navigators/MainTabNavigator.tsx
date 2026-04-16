import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StackActions } from "@react-navigation/native";
import * as Screens from "@/screens";
import { useAppTheme } from "@/theme/context";

import { CatalogNavigator } from "./CatalogNavigator";
import type { MainTabParamList } from "./navigationTypes";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<keyof MainTabParamList, { focused: IoniconName; default: IoniconName }> = {
  Home: { focused: "home", default: "home-outline" },
  Catalog: { focused: "grid", default: "grid-outline" },
  Transactions: { focused: "receipt", default: "receipt-outline" },
  Settings: { focused: "settings", default: "settings-outline" },
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tintInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          return (
            <Ionicons name={focused ? icons.focused : icons.default} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={Screens.HomeScreen} />
      <Tab.Screen
        name="Catalog"
        component={CatalogNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            const state = route.state;
            if (state && state.index > 0) {
              navigation.dispatch({
                ...StackActions.popToTop(),
                target: state.key,
              });
            }
          },
        })}
      />
      <Tab.Screen name="Transactions" component={Screens.TransactionsScreen} />
      <Tab.Screen name="Settings" component={Screens.SettingsScreen} />
    </Tab.Navigator>
  );
};
