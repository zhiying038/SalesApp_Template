import { FC } from "react";
import { Flex, Text } from "@/components";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import { $infoRow, $labelCol } from "./styles";

type Props = {
  label: string;
  value?: string;
};

export const InfoRow: FC<Props> = ({ label, value }) => {
  const { themed } = useAppTheme();

  if (!value) return null;

  return (
    <Flex.Row gutter={8} align="start" style={themed($infoRow)}>
      <Flex.Col flex="none" style={themed($labelCol)}>
        <Text size="xxs" style={$styles.dimText}>
          {label}
        </Text>
      </Flex.Col>
      <Flex.Col flex="1">
        <Text size="xxs">{value}</Text>
      </Flex.Col>
    </Flex.Row>
  );
};
