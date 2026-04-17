import { FC } from "react";
import { SectionCard, Text } from "@/components";
import type { BusinessPartner } from "@/services/api";
import { $styles } from "@/theme/styles";
import { InfoRow } from "./InfoRow";

type Props = {
  cardName: string | null | undefined;
  cardCode: string | null | undefined;
  customer: BusinessPartner | null;
  isLoading: boolean;
};

export const CustomerCard: FC<Props> = ({ cardName, cardCode, customer, isLoading }) => {
  return (
    <SectionCard title="Customer" isLoading={isLoading && !customer}>
      <Text size="xxs" weight="medium" numberOfLines={1}>
        {cardName || "—"}
      </Text>
      <Text size="xxs" style={$styles.dimText}>
        {cardCode ?? ""}
      </Text>
      <InfoRow label="Email" value={customer?.Email} />
      <InfoRow label="Phone" value={customer?.Phone1 ?? customer?.Cellular} />
    </SectionCard>
  );
};
