import React from "react";
import Thesis from "./Thesis";
import { ThesisData } from "@/interfaces/ThesisData";
import { svgLibrary } from "@/utils/data/others";

interface ThesesProps {
  theses: ThesisData[] | [];
  land?: boolean;
}

const Theses: React.FC<ThesesProps> = ({ theses, land }) => {
  return (
    <div>
      {theses &&
        theses.map((thesis, index) => (
          <Thesis
            key={index}
            thesis={thesis}
            land={land}
            icon={svgLibrary[index]}
          />
        ))}
    </div>
  );
};

export default Theses;
