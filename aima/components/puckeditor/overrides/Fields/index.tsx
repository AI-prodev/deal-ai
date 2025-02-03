import Actions from "./Actions";
import React, { ReactNode } from "react";

interface IFieldsProps {
  children: ReactNode;
}

const Fields = ({ children }: IFieldsProps) => {
  return (
    <div>
      <Actions />
      {children}
    </div>
  );
};

export default Fields;
