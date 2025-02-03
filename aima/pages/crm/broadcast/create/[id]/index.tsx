import BroadcastTabsWrapper from "@/components/crm/broadcast/BroadcastTabsWrapper";
import { CRMBroadcastType, SendEmailMode } from "@/components/crm/constants";
import SendEmail from "@/components/crm/broadcast/SendEmail";

const EditEmail = () => {
  return (
    <BroadcastTabsWrapper activeTab={CRMBroadcastType.CREATE}>
      <SendEmail mode={SendEmailMode.EDIT} />
    </BroadcastTabsWrapper>
  );
};

export default EditEmail;
