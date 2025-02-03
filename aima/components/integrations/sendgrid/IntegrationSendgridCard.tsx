import {
  useAddIntegrationMutation,
  useDeleteIntegrationMutation,
} from "@/store/features/integrationsApi";
import { useState } from "react";
import clsx from "clsx";
import { KeySVG, LoadingSpinnerSVG } from "@/components/icons/SVGData";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Swal from "sweetalert2";
import { SendgridAccountType } from "@/components/integrations/sendgrid/IntegrationSendgrid";

interface Props {
  account: SendgridAccountType | null;
  isFetching: boolean;
}

const IntegrationSendgridCard: React.FC<Props> = ({ account, isFetching }) => {
  const [addIntegration] = useAddIntegrationMutation();
  const [deleteIntegration] = useDeleteIntegrationMutation();
  const [apiKey, setApiKey] = useState("");

  const addKey = async () => {
    if (!apiKey) {
      showErrorToast("Please enter a valid SendGrid API Key");
      return;
    }
    await addIntegration({ type: "sendgrid", data: { apiKey } })
      .then((res: any) => {
        if (res.error) {
          showErrorToast(
            res.error?.data?.error || "Failed to add SendGrid API Key"
          );
          return;
        }

        setApiKey("");
        showSuccessToast({
          title: "SendGrid API Key added successfully",
        });
      })
      .catch(() => {
        showErrorToast("Failed to add SendGrid API Key");
      });
  };

  const removeKey = async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-secondary",
        cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
        popup: "sweet-alerts",
      },
      buttonsStyling: false,
    });

    await swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Are you sure you want to remove SendGrid API Key?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
        padding: "2em",
      })
      .then(async result => {
        if (result.value) {
          await deleteIntegration(account!._id);
          showSuccessToast({
            title: "SendGrid API Key removed successfully",
          });
        }
      });
  };

  if (!account) {
    return (
      <div
        className={
          "flex justify-between items-center p-6 mb-1 w-[780px] h-[80px] bg-[#121E32] rounded-[6px] rounded-tl-none"
        }
      >
        <input
          type={"text"}
          className={"form-input max-w-[400px] border-none !bg-[#1a2941]"}
          placeholder={"Enter SendGrid API Key..."}
          value={apiKey}
          defaultValue={""}
          onChange={e => setApiKey(e.target.value)}
          disabled={account || isFetching}
        />
        <button
          className={clsx("btn min-w-[200px]", {
            "btn-secondary border-none bg-stone-400 cursor-not-allowed":
              isFetching,
            "btn-danger": !isFetching && account,
            "btn-primary": !isFetching && !account,
          })}
          onClick={account ? removeKey : addKey}
          disabled={isFetching}
        >
          {isFetching && (
            <div className={"animate-spin"}>
              <LoadingSpinnerSVG />
            </div>
          )}
          {!isFetching && (account ? "Remove Key" : "Add Key")}
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        "grid grid-cols-2 gap-2 justify-between items-center p-6 mb-1 w-[780px] bg-[#121e32] rounded-[6px] rounded-tl-none"
      }
    >
      <input
        type={"text"}
        className={
          "form-input max-w-[400px] border-none rounded-none !bg-[#1a2941]"
        }
        placeholder={"Enter SendGrid API Key..."}
        value={account.data?.apiKey}
        defaultValue={account.data?.apiKey}
        onChange={e => setApiKey(e.target.value)}
        disabled={!!account || isFetching}
      />

      <span className={"flex justify-end"}>
        <KeySVG />
      </span>

      <input
        type={"text"}
        className={"form-input w-auto border-none rounded-none !bg-[#1a2941]"}
        value={`${account.data?.first_name} ${account.data?.last_name}`}
        defaultValue={`${account.data?.first_name} ${account.data?.last_name}`}
        disabled={true}
      />

      <input
        type={"text"}
        className={
          "form-input w-auto flex justify-end border-none rounded-none !bg-[#1a2941]"
        }
        value={account.data?.company}
        defaultValue={account.data?.company}
        disabled={true}
      />

      <input
        type={"text"}
        className={"form-input w-auto border-none rounded-none !bg-[#1a2941]"}
        value={account.data?.email}
        defaultValue={account.data?.email}
        disabled={true}
      />

      <input
        type={"text"}
        className={
          "form-input w-auto flex justify-end border-none rounded-none !bg-[#1a2941]"
        }
        value={account.data?.phone}
        defaultValue={account.data?.phone}
        disabled={true}
      />

      <input
        type={"text"}
        className={"form-input w-auto border-none rounded-none !bg-[#1a2941]"}
        value={account.data?.city}
        defaultValue={account.data?.city}
        disabled={true}
      />

      <input
        type={"text"}
        className={
          "form-input w-auto flex justify-end border-none rounded-none !bg-[#1a2941]"
        }
        value={account.data?.state}
        defaultValue={account.data?.state}
        disabled={true}
      />

      <input
        type={"text"}
        className={`form-input w-auto border-none rounded-none !bg-[#1a2941]`}
        value={account.data?.country}
        defaultValue={account.data?.country}
        disabled={true}
      />

      <span></span>
      <span></span>

      <button
        className={clsx("btn min-w-[200px]", {
          "btn-secondary bg-[#AAA] cursor-not-allowed border-none": isFetching,
          "btn-danger": !isFetching && account,
        })}
        onClick={removeKey}
        disabled={isFetching}
      >
        {isFetching && (
          <div className={"animate-spin"}>
            <LoadingSpinnerSVG />
          </div>
        )}
        {!isFetching && "Remove Key"}
      </button>
    </div>
  );
};

export default IntegrationSendgridCard;
