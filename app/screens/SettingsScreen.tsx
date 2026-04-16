import { FC } from "react"
import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import type { MainTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useHeader } from "@/utils/useHeader"

export const SettingsScreen: FC<MainTabScreenProps<"Settings">> = function SettingsScreen() {
  const { themed } = useAppTheme()

  useHeader({
    title: "Settings",
  })

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top"]}
      contentContainerStyle={themed($container)}
    ></Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  ...$styles.flex1,
  padding: spacing.lg,
})
