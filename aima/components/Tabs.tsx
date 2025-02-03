import { IntegrationType } from "@/components/integrations/IntegrationTabs";
import Link from "next/link";
import { CRMBroadcastType, CRMType } from "@/components/crm/constants";
import { SmallStartSVG } from "@/components/icons/SVGData";
import clsx from "clsx";
import { usePermissions } from "@/hooks/usePermissions";

export interface ITab {
  title: string;
  url: string;
  type: IntegrationType | CRMType | CRMBroadcastType;
  icon?: any;
  isNew?: boolean;
  isUnreleased?: boolean;
  isAdminOnly?: boolean;
}

interface Props {
  items: ITab[];
  activeTab: string;
}

const Tabs: React.FC<Props> = ({ items, activeTab }) => {
  const { isAdmin } = usePermissions();
  const allowedTabs = items?.filter(item => {
    // If tab is for admin use only
    if (item.isAdminOnly && !isAdmin) return false;

    // If on production, only return if item is not `isUnreleased`
    return (
      item?.isUnreleased !== true ||
      process.env.NEXT_PUBLIC_HIDE_UNRELEASED !== "true"
    );
  });

  return (
    <div className="flex">
      {allowedTabs.map((item: ITab, index) => (
        <Link href={item.url} key={index}>
          <div
            className={clsx(
              `flex justify-between items-center gap-2 cursor-pointer w-auto h-[40px] pl-[12px] pr-[12px] color-white size-[16px] font-[400] leading-[22px] tracking-[0em]`,
              {
                "bg-[#1a2941]": activeTab === item.type,
                "bg-[#121e32]": activeTab !== item.type,
                "rounded-none rounded-tl-[6px]": index === 0,
                "rounded-none rounded-tr-[6px]":
                  index === allowedTabs.length - 1,
              }
            )}
          >
            <h3>{item.title}</h3>
            {item?.icon && <item.icon />}
            {item?.isNew && (
              <div className="h-full pt-1.5">
                <div className="flex bg-[#ed390d] rounded-lg px-1.5 py-0.5 h-4">
                  <p className="text-white text-[8px] font-semibold leading-[14px]">
                    NEW
                  </p>
                  <SmallStartSVG />
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Tabs;
