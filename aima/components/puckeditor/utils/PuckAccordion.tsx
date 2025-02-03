import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ArrowDownSVG } from "@/components/icons/SVGData";
import { FC, ReactNode } from "react";

interface IPuckAccordionProps {
  label?: string;
  children: ReactNode;
}

const PuckAccordion: FC<IPuckAccordionProps> = ({ label, children }) => {
  return (
    <Accordion className="!bg-white !text-[#5a5a5a]">
      {label && (
        <AccordionSummary
          expandIcon={<ArrowDownSVG className="!fill-[#5a5a5a] w-5 h-5" />}
          className="font-semibold"
        >
          {label}
        </AccordionSummary>
      )}
      <AccordionDetails className="text-lg">{children}</AccordionDetails>
    </Accordion>
  );
};

export default PuckAccordion;
