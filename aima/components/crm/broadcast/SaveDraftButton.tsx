import React from "react";
import { ISendEmailFormValues, SendEmailBody } from "@/interfaces/IBroadcast";
import { useSendEmailMutation } from "@/store/features/broadcastApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useRouter } from "next/router";
import { SendEmailStatus } from "@/components/crm/constants";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ISaveDraftButtonProps {
  sendEmailData: ISendEmailFormValues | null;
}

const SaveDraftButton = ({ sendEmailData }: ISaveDraftButtonProps) => {
  const { push } = useRouter();
  const [saveDraft, { isLoading }] = useSendEmailMutation();

  const handleCreateSaveDraftButton = async (): Promise<void> => {
    if (sendEmailData) {
      const body: SendEmailBody = {
        ...sendEmailData,
        lists: sendEmailData?.lists?.map(list => list?.value),
        status: SendEmailStatus.draft,
        scheduledAt: null,
      };

      await saveDraft(body)
        .then((res: any) => {
          if (res.error) {
            showErrorToast(res.error?.data?.error || "Failed to save draft");
            return;
          }

          showSuccessToast({
            title: "Email draft saved successfully",
          });
          push("/crm/broadcast/drafts");
        })
        .catch(() => {
          showErrorToast("Failed to save draft");
        });
    }
  };

  return (
    <button
      className="rounded bg-primary px-4 py-2 text-white disabled:bg-opacity-70 min-w-36"
      type="button"
      onClick={handleCreateSaveDraftButton}
      disabled={isLoading}
    >
      {isLoading ? <LoadingSpinner /> : "Save Draft"}
    </button>
  );
};

export default SaveDraftButton;
