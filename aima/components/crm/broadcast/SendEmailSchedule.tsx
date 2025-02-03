"use client";

import React, { ChangeEvent, useState } from "react";
import clsx from "clsx";
import { Switch, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import { ISendEmailFormValues, SendEmailBody } from "@/interfaces/IBroadcast";
import {
  useSendEmailMutation,
  useUpdateEmailMutation,
} from "@/store/features/broadcastApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useRouter } from "next/router";
import { SendEmailMode, SendEmailStatus } from "@/components/crm/constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import SaveDraftButton from "@/components/crm/broadcast/SaveDraftButton";
import { useGetAllContactsQuery } from "@/store/features/contactApi";

interface ISendEmailScheduleProps {
  sendEmailData: ISendEmailFormValues | null;
  mode: SendEmailMode;
}

const SendEmailSchedule = ({
  sendEmailData,
  mode,
}: ISendEmailScheduleProps) => {
  const [isSendNow, setIsSendNow] = useState<boolean>(true);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [updateEmail, { isLoading: isUpdateEmailLoading }] =
    useUpdateEmailMutation();
  const [createEmailMessage, { isLoading: isCreateEmailMessageLoading }] =
    useSendEmailMutation();
  const { data: getAllContacts } = useGetAllContactsQuery({});
  const { push, query } = useRouter();
  const emailId = query?.id as string;
  const isLoading = isUpdateEmailLoading || isCreateEmailMessageLoading;

  const handleChangeScheduleDate = (
    event: ChangeEvent<HTMLDataElement>
  ): void => {
    setScheduleDate(event.target.value);
  };

  const handleClickSendButton = (): void => {
    const isAllContacts = sendEmailData?.lists?.some(
      item => item?.value === "All Contacts"
    );

    Swal.fire({
      title: "Are you ready to send this now?",
      text: isAllContacts
        ? `This will send the email to ${getAllContacts?.totalCount} people.`
        : `This will send the email to ${sendEmailData?.sumListsContacts} people in ${sendEmailData?.lists?.length} lists.`,
      icon: "warning",
      reverseButtons: true,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#4361ee",
      confirmButtonText: "Send Now",
    }).then(async result => {
      if (result.isConfirmed && sendEmailData) {
        const request =
          mode === SendEmailMode.CREATE ? createEmailMessage : updateEmail;

        const body: SendEmailBody & { emailId: string } = {
          ...sendEmailData,
          lists: sendEmailData?.lists?.map(list => list?.value),
          status: isSendNow
            ? SendEmailStatus.sendNow
            : SendEmailStatus.scheduled,
          scheduledAt: isSendNow ? null : scheduleDate,
          emailId,
        };

        await request(body)
          .then((res: any) => {
            if (res.error) {
              showErrorToast(res.error?.data?.error || "Failed to send email");
              return;
            }

            showSuccessToast({
              title: isSendNow
                ? "Email sent successfully"
                : "Email scheduled successfully",
            });
            push(
              isSendNow
                ? `/crm/broadcast/reports/${res?.data?.newBroadcastEmail?._id || emailId}`
                : "/crm/broadcast/scheduled"
            );
          })
          .catch(() => {
            showErrorToast("Failed to send email");
          });
      }
    });
  };

  return (
    <div className="flex flex-col h-80">
      <div className="inline-flex items-center">
        <Switch
          id="sendNow"
          name="sendNow"
          checked={isSendNow}
          // onChange={setIsSendNow}
          className={clsx(
            "relative inline-flex h-6 w-11 items-center rounded-full",
            {
              "bg-primary": isSendNow,
              "bg-gray-500": !isSendNow,
            }
          )}
        >
          <span className="sr-only">Send Now</span>
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition",
              {
                "translate-x-6": isSendNow,
                "translate-x-1": !isSendNow,
              }
            )}
          />
        </Switch>
        <label htmlFor="sendNow" className="ml-2 mb-0">
          Send Now
        </label>
      </div>
      <Transition
        show={!isSendNow}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="mt-5">
          <label
            htmlFor="scheduleBroadcast"
            className="mb-2 block text-sm font-semibold"
          >
            Schedule Broadcast
          </label>
          <input
            id="scheduleBroadcast"
            type="date"
            name="scheduleBroadcast"
            className="form-input w-64"
            value={scheduleDate}
            onChange={handleChangeScheduleDate}
          />
        </div>
      </Transition>
      <div
        className={clsx("flex mt-auto", {
          "justify-between": mode === SendEmailMode.CREATE,
          "justify-end": mode === SendEmailMode.EDIT,
        })}
      >
        {mode === SendEmailMode.CREATE && (
          <SaveDraftButton sendEmailData={sendEmailData} />
        )}
        <button
          className="w-1/3 sm:w-[20%] rounded bg-primary py-2 text-white disabled:bg-opacity-70"
          onClick={handleClickSendButton}
          disabled={(!isSendNow && !scheduleDate) || isLoading}
        >
          {!isLoading && (isSendNow ? "Send" : "Schedule")}
          {isLoading && <LoadingSpinner />}
        </button>
      </div>
    </div>
  );
};

export default SendEmailSchedule;
