import { CRMBroadcastType, SendEmailStatus } from "@/components/crm/constants";
import BroadcastTabsWrapper from "@/components/crm/broadcast/BroadcastTabsWrapper";
import DraftsScheduledTable from "@/components/crm/broadcast/DraftsScheduledTable";

const Drafts = () => (
  <BroadcastTabsWrapper activeTab={CRMBroadcastType.DRAFTS}>
    <DraftsScheduledTable status={SendEmailStatus.draft} />
  </BroadcastTabsWrapper>
);

export default Drafts;
