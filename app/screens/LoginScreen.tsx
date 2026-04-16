import { ComponentType, FC, useMemo, useRef, useState } from "react";
import { ImageStyle, Pressable, TextInput, View, ViewStyle } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { AutoImage, Button, Icon, Screen, TextField, TextFieldAccessoryProps } from "@/components";
import { useAuth } from "@/contexts";
import { AuthStackScreenProps } from "@/navigators";
import { api, LoginCredentials } from "@/services/api";
import { ThemedStyle, useAppTheme } from "@/theme";

export const LoginScreen: FC<AuthStackScreenProps<"Login">> = () => {
  // ========== HOOKS
  const { setAuthToken } = useAuth();
  const { themed } = useAppTheme();
  const passwordRef = useRef<TextInput>(null);
  const { control, handleSubmit } = useForm<LoginCredentials>();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ========== EVENTS
  const onSubmit = async (values: LoginCredentials) => {
    try {
      setIsLoading(true);
      const result = await api.login(values);
      if (result.kind !== "ok") throw new Error(result.message);
      setAuthToken(result.result.token);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== VIEWS
  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Icon size={20} containerStyle={props.style} icon={!showPassword ? "view" : "hidden"} />
          </Pressable>
        );
      },
    [showPassword],
  );

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($screen)}
    >
      <AutoImage
        resizeMode="contain"
        style={themed($logo)}
        source={require("@assets/images/fast-track.png")}
      />

      <View style={themed($form)}>
        <Controller
          name="Username"
          control={control}
          rules={{ required: "Username is required." }}
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              value={value}
              label="Username"
              autoCorrect={false}
              returnKeyType="next"
              autoCapitalize="none"
              helper={error?.message}
              status={error ? "error" : undefined}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          )}
        />

        <Controller
          name="Password"
          control={control}
          rules={{ required: "Password is required." }}
          render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
            <TextField
              ref={passwordRef}
              value={value}
              label="Password"
              secureTextEntry
              autoCorrect={false}
              returnKeyType="done"
              autoCapitalize="none"
              helper={error?.message}
              status={error ? "error" : undefined}
              RightAccessory={PasswordRightAccessory}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
        />

        <Button
          preset="filled"
          disabled={isLoading}
          text={isLoading ? "Signing in…" : "Sign In"}
          onPress={handleSubmit(onSubmit)}
          style={themed($signInButton)}
        />
      </View>
    </Screen>
  );
};

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  justifyContent: "center",
});

const $signInButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
});

const $logo: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  height: 100,
  width: "100%",
  marginBottom: spacing.lg,
});

const $form: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});
