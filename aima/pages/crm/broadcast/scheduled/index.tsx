import { CRMBroadcastType, SendEmailStatus } from "@/components/crm/constants";
import BroadcastTabsWrapper from "@/components/crm/broadcast/BroadcastTabsWrapper";
import DraftsScheduledTable from "@/components/crm/broadcast/DraftsScheduledTable";

const Scheduled = () => (
  <BroadcastTabsWrapper activeTab={CRMBroadcastType.SCHEDULED}>
    <DraftsScheduledTable status={SendEmailStatus.scheduled} />
  </BroadcastTabsWrapper>
);

export default Scheduled;
