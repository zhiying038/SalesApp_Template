import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Screens from "@/screens";
import { useAppTheme } from "@/theme";
import type { AuthStackParamList } from "./navigationTypes";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
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
      <Stack.Screen name="Login" component={Screens.LoginScreen} />
    </Stack.Navigator>
  );
}
