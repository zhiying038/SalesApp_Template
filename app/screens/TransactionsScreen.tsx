import { FC } from "react"
import { Pressable, ViewStyle, TextStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { MainTabScreenProps } from "@/navigators/navigationTypes"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { useHeader } from "@/utils/useHeader"

type TransactionType = "salesOrder" | "salesQuotation" | "activity"

const TRANSACTION_TYPES: { key: TransactionType; label: string }[] = [
  { key: "salesOrder", label: "Sales Order" },
  { key: "salesQuotation", label: "Sales Quotation" },
  { key: "activity", label: "Activity" },
]

export const TransactionsScreen: FC<MainTabScreenProps<"Transactions">> = () => {
  const { themed } = useAppTheme()

  useHeader({
    title: "Transactions",
  })

  return (
    <Screen preset="fixed">
      {TRANSACTION_TYPES.map(({ key, label }) => {
        return (
          <Pressable key={key} style={themed($tabInactive)}>
            <Text text={label} size="xs" weight="normal" style={themed($tabLabelInactive)} />
          </Pressable>
        )
      })}
    </Screen>
  )
}

const $tabInactive: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  alignItems: "center",
})

const $tabLabelInactive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
