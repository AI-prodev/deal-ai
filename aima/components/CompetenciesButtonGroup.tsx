import React, { useCallback } from "react";
import ButtonGroup from "./ButtonGroup";
import { Button } from "./Button";

interface CompetenciesButtonGroupProps {
  onSelectedCompetencies: (commaSeparatedString: string) => void;
}

const CompetenciesButtonGroup: React.FC<CompetenciesButtonGroupProps> = ({
  onSelectedCompetencies,
}) => {
  const buttons: Button[] = [
    {
      label: "Leadership",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M6 18L8.5 15.5M18 6H9M18 6V15M18 6L11.5 12.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>      
      `,
    },
    {
      label: "Strategic Thinking",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M11.25 22C11.25 22.4142 11.5858 22.75 12 22.75C12.4142 22.75 12.75 22.4142 12.75 22H11.25ZM11.25 21V22H12.75V21H11.25Z" fill="#ffffff"/>
        <path d="M12.8569 7L9.99972 10H13.9997L11.1426 13" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.5 18V19.5C13.5 19.9659 13.5 20.1989 13.4239 20.3827C13.3224 20.6277 13.1277 20.8224 12.8827 20.9239C12.6989 21 12.4659 21 12 21C11.5341 21 11.3011 21 11.1173 20.9239C10.8723 20.8224 10.6776 20.6277 10.5761 20.3827C10.5 20.1989 10.5 19.9659 10.5 19.5V18" stroke="#ffffff" strokeWidth="1.5"/>
        <path d="M4.58152 7C4.20651 7.92643 4 8.9391 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C10.9391 2 9.92643 2.20651 9 2.58152" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>      
      `,
    },
    {
      label: "Communication",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <circle cx="10" cy="6" r="4" stroke="#ffffff" strokeWidth="1.5"/>
        <path d="M19 2C19 2 21 3.2 21 6C21 8.8 19 10 19 10" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 4C17 4 18 4.6 18 6C18 7.4 17 8 17 8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17.9975 18C18 17.8358 18 17.669 18 17.5C18 15.0147 14.4183 13 10 13C5.58172 13 2 15.0147 2 17.5C2 19.9853 2 22 10 22C12.231 22 13.8398 21.8433 15 21.5634" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>      
      `,
    },
    {
      label: "Financial Management",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M7 14L9.29289 11.7071C9.68342 11.3166 10.3166 11.3166 10.7071 11.7071L12.2929 13.2929C12.6834 13.6834 13.3166 13.6834 13.7071 13.2929L17 10M17 10V12.5M17 10H14.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      `,
    },
    {
      label: "Project Management",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M2 12C2 17.5228 6.47715 22 12 22C13.8214 22 15.5291 21.513 17 20.6622M12 2C17.5228 2 22 6.47715 22 12C22 13.8214 21.513 15.5291 20.6622 17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 9V13H16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 20.6622C15.5291 21.513 13.8214 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 13.8214 21.513 15.5291 20.6622 17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" stroke-dasharray="0.5 3.5"/>
      `,
    },
    {
      label: "Marketing and Sales",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M3.17157 20.8284C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6569 22 17.7712 22 14C22 12.8302 22 11.8419 21.965 11M20.8284 7.17157C19.6569 6 17.7712 6 14 6H10C6.22876 6 4.34315 6 3.17157 7.17157C2 8.34315 2 10.2288 2 14C2 15.1698 2 16.1581 2.03496 17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 2C13.8856 2 14.8284 2 15.4142 2.58579C16 3.17157 16 4.11438 16 6M8.58579 2.58579C8 3.17157 8 4.11438 8 6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 17.3333C13.1046 17.3333 14 16.5871 14 15.6667C14 14.7462 13.1046 14 12 14C10.8954 14 10 13.2538 10 12.3333C10 11.4129 10.8954 10.6667 12 10.6667M12 17.3333C10.8954 17.3333 10 16.5871 10 15.6667M12 17.3333V18M12 10V10.6667M12 10.6667C13.1046 10.6667 14 11.4129 14 12.3333" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>      
      `,
    },
    {
      label: "Data Analysis",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M4 18V6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 12L20 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 10C16.4183 10 20 8.20914 20 6C20 3.79086 16.4183 2 12 2C7.58172 2 4 3.79086 4 6C4 8.20914 7.58172 10 12 10Z" stroke="#ffffff" strokeWidth="1.5"/>
        <path d="M20 12C20 14.2091 16.4183 16 12 16C7.58172 16 4 14.2091 4 12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 18C20 20.2091 16.4183 22 12 22C7.58172 22 4 20.2091 4 18" stroke="#ffffff" strokeWidth="1.5"/>      
      `,
    },
    {
      label: "Relationship Management",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M12 6C8.68629 6 6 8.68629 6 12C6 13.6569 6.67157 15.1569 7.75736 16.2426M16.2426 16.2426C17.3284 15.1569 18 13.6569 18 12C18 10.7733 17.6318 9.63251 17 8.6822" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 14.7614 20.8807 17.2614 19.0711 19.0711M4.92893 19.0711C3.11929 17.2614 2 14.7614 2 12C2 8.29859 4.01099 5.06687 7 3.33782" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" stroke="#ffffff" strokeWidth="1.5"/>
        <path d="M9.88736 17.3441C10.8467 16.4683 11.3264 16.0304 11.9187 16.002C11.9729 15.9993 12.0271 15.9993 12.0813 16.002C12.6736 16.0304 13.1533 16.4683 14.1126 17.3441C16.2001 19.2497 17.2439 20.2025 16.9517 21.0245C16.9266 21.0952 16.8954 21.1639 16.8584 21.2301C16.4282 22 14.9522 22 12 22C9.04784 22 7.57176 22 7.14161 21.2301C7.10463 21.1639 7.07344 21.0952 7.04832 21.0245C6.75612 20.2025 7.79987 19.2497 9.88736 17.3441Z" stroke="#ffffff" strokeWidth="1.5"/>      
      `,
    },
    {
      label: "Technology",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M17 15H14.5H12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 10L7.2344 10.1953C8.51608 11.2634 9.15693 11.7974 9.15693 12.5C9.15693 13.2026 8.51608 13.7366 7.2344 14.8047L7 15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      `,
    },
    {
      label: "Emotional Intelligence",
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      svgContent: `
        <path d="M8 13H16C17.7107 13 19.1506 14.2804 19.3505 15.9795L20 21.5M8 13C5.2421 12.3871 3.06717 10.2687 2.38197 7.52787L2 6M8 13V18C8 19.8856 8 20.8284 8.58579 21.4142C9.17157 22 10.1144 22 12 22C13.8856 22 14.8284 22 15.4142 21.4142C16 20.8284 16 19.8856 16 18V17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="6" r="4" stroke="#ffffff" strokeWidth="1.5"/>      
      `,
    },
  ];

  const handleSelect = useCallback(
    (selectedButtons: Button[]) => {
      const selectedButtonValues = selectedButtons.map(button => button.label);
      const commaSeparatedString = selectedButtonValues.join(", ");
      onSelectedCompetencies(commaSeparatedString);
    },
    [onSelectedCompetencies]
  );

  return (
    <div>
      <ButtonGroup buttons={buttons} onSelect={handleSelect} />
    </div>
  );
};

export default CompetenciesButtonGroup;
