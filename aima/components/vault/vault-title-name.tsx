import React from "react";
import { useDrop } from "react-dnd";
type VaultTitleNameProps = {
  onDrop: (item: { id: string; type: "file" | "folder" }) => void;
  displayName: string;
  isSubFolders: boolean;
};
const VaultTitleName = ({
  onDrop,
  displayName,
  isSubFolders,
}: VaultTitleNameProps) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "file",
      drop: onDrop,
      collect: (monitor: any) => ({
        isOver: monitor.isOver(),
      }),
    }),
    []
  );

  return (
    <span ref={drop}>
      {isSubFolders ? <>&nbsp;&rarr;&rarr;</> : <>&nbsp;&rarr;</>} {displayName}
    </span>
  );
};

export default VaultTitleName;
