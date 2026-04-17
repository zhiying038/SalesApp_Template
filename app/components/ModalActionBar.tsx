import { FC, ReactNode } from "react";
import { Button } from "@/components/Button";
import { Flex } from "@/components/Flex";

type Props = {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  cancelLabel?: string;
  saveLabel?: string;
  savingLabel?: string;
  leading?: ReactNode;
};

export const ModalActionBar: FC<Props> = ({
  onCancel,
  onSave,
  isSaving = false,
  cancelLabel = "Cancel",
  saveLabel = "Save",
  savingLabel = "Saving...",
  leading,
}) => {
  return (
    <Flex.Row justify="between" align="center">
      <Flex.Col flex="1">{leading ?? null}</Flex.Col>
      <Flex.Row gutter={8}>
        <Flex.Col>
          <Button preset="default" disabled={isSaving} onPress={onCancel}>
            {cancelLabel}
          </Button>
        </Flex.Col>
        <Flex.Col>
          <Button preset="filled" disabled={isSaving} onPress={onSave}>
            {isSaving ? savingLabel : saveLabel}
          </Button>
        </Flex.Col>
      </Flex.Row>
    </Flex.Row>
  );
};
