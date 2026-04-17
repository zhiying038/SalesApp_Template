import { FC } from "react";
import { SectionCard, Text } from "@/components";
import type { CustomerAddress } from "@/services/api";
import { useAppTheme } from "@/theme/context";
import { formatAddress } from "./helpers";

type Props = {
  title: string;
  address: CustomerAddress | undefined;
  isLoading: boolean;
};

export const AddressCard: FC<Props> = ({ title, address, isLoading }) => {
  const { theme } = useAppTheme();

  return (
    <SectionCard title={title} trailing={address?.AddressName ?? undefined} isLoading={isLoading}>
      {address ? (
        <Text size="xxs">{formatAddress(address) || "-"}</Text>
      ) : (
        <Text size="xxs" style={{ color: theme.colors.error }}>
          -
        </Text>
      )}
    </SectionCard>
  );
};
