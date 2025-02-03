import React, { useCallback } from "react";
import ButtonGroup from "../ButtonGroup";
import { Button } from "../Button";

interface SocratesLandButtonGroupsProps {
  buttons: Button[];
  onSelectedItems: (commaSeparatedString: string) => void;
  selectAll?: boolean;
}

const SocratesLandButtonGroups: React.FC<SocratesLandButtonGroupsProps> = ({
  buttons,
  onSelectedItems,
  selectAll = false,
}) => {
  const handleSelect = useCallback(
    (selectedButtons: Button[]) => {
      if (selectAll) {
        handleSelectAll(selectedButtons, buttons);
      } else {
        const selectedButtonValues = selectedButtons.map(
          button => button.label
        );
        const commaSeparatedString = selectedButtonValues.join(", ");
        onSelectedItems(commaSeparatedString);
      }
    },
    [onSelectedItems, buttons, selectAll]
  );

  const handleSelectAll = useCallback(
    (selectedButtons: Button[], allButtons: Button[]) => {
      const selectedButtonValues = selectedButtons.map(button => button.label);
      const commaSeparatedString = selectedButtonValues.join(", ");
      onSelectedItems(commaSeparatedString);
    },
    [onSelectedItems]
  );

  return (
    <div>
      <ButtonGroup
        buttons={buttons}
        onSelect={handleSelect}
        selectAll={selectAll}
        includeSelectAll
      />
    </div>
  );
};

export default SocratesLandButtonGroups;
