import React from "react";
import Tippy from "@tippyjs/react";

interface LabeledTooltipProps {
  labelText: string;
  tooltipContent: string;
  tooltipIconContentLink?: string;
}

interface TooltipIconProps {
  content: string;
  link: string;
}

export const TooltipIcon: React.FC<TooltipIconProps> = ({ content, link }) => (
  <Tippy
    allowHTML={true}
    placement="top"
    interactive={true}
    delay={[300, 0]}
    content={<div dangerouslySetInnerHTML={{ __html: content }} />}
  >
    <button
      type="button"
      onClick={() => window.open(link, "_blank")}
      className="cursor-pointer"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="mx-2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.125 8.875C10.125 7.83947 10.9645 7 12 7C13.0355 7 13.875 7.83947 13.875 8.875C13.875 9.56245 13.505 10.1635 12.9534 10.4899C12.478 10.7711 12 11.1977 12 11.75V13"
          stroke="#FFFF"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <circle cx="12" cy="16" r="1" fill="#FFFF" />
        <path
          d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
          stroke="#FFFF"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </Tippy>
);

export const LabeledTooltip: React.FC<LabeledTooltipProps> = ({
  labelText,
  tooltipContent,
  tooltipIconContentLink = `    
  https://help.deal.ai
`,
}) => {
  return (
    <label className="ml-3 flex w-fit text-left font-semibold text-white">
      <Tippy
        allowHTML={true}
        placement="top"
        interactive={true}
        delay={[300, 0]}
        content={<div dangerouslySetInnerHTML={{ __html: tooltipContent }} />}
      >
        <span className="text-white">{labelText}</span>
      </Tippy>
      <TooltipIcon
        content={`<a
        href=${tooltipIconContentLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Find out more
      </a>`}
        link={tooltipIconContentLink}
      />
    </label>
  );
};
