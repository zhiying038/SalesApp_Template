import { FC } from "react";
import { SectionCard, Text } from "@/components";
import type { CustomerContact } from "@/services/api";
import { $styles } from "@/theme/styles";
import { InfoRow } from "./InfoRow";

type Props = {
  contact: CustomerContact | undefined;
  isLoading: boolean;
};

export const ContactCard: FC<Props> = ({ contact, isLoading }) => {
  return (
    <SectionCard title="Contact Person" isLoading={isLoading && !contact}>
      {contact ? (
        <>
          <Text size="xxs" weight="medium">
            {contact.Name}
          </Text>
          {contact.Position ? (
            <Text size="xxs" style={$styles.dimText}>
              {contact.Position}
            </Text>
          ) : null}
          <InfoRow label="Email" value={contact.Email} />
          <InfoRow label="Phone" value={contact.Phone} />
          <InfoRow label="Mobile" value={contact.Mobile} />
        </>
      ) : (
        <Text size="xxs" style={$styles.dimText}>
          -
        </Text>
      )}
    </SectionCard>
  );
};
