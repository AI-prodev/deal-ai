import Link from "next/link";
import React from "react";
import {
  SEND_EMAIL_ERRORS,
  SendEmailErrorType,
} from "@/components/crm/constants";

interface ISendEmailApiKeyErrorProps {
  type: SendEmailErrorType;
}

const SendEmailError = ({ type }: ISendEmailApiKeyErrorProps) => (
  <div className="bg-[#ed390d] rounded px-4 py-1.5 mb-5">
    <p className="text-white">
      {SEND_EMAIL_ERRORS?.[type].message}{" "}
      <Link href={SEND_EMAIL_ERRORS?.[type].url} className="underline">
        Click here.
      </Link>
    </p>
  </div>
);

export default SendEmailError;
