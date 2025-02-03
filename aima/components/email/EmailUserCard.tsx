import { IFunnel } from "@/interfaces/IFunnel";
import { format } from "date-fns";
import React, { FC, useState } from "react";
import {
  GlobeSVG,
  FilterSVG,
  ArchiveSVG,
  PersonSVG,
  DotsSVG,
  TrashSVG,
  EyeSVG,
  CopySVG,
  SmallStartSVG,
  EyeSlashSVG,
  ArrowTopRightSVG,
  ShareSVG,
  LockClosedSVG,
  HelpRaftSVG,
} from "@/components/icons/SVGData";
import { FunnelType } from "@/enums/funnel-type.enum";
import { Tabs } from "@/pages/websites";
import { FunnelTabs } from "@/pages/funnels";
import { IEmailUser } from "@/interfaces/IEmailUser";
import Dropdown from "../Dropdown";
import { createEmailUserAPI } from "@/store/features/emailUserApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Link from "next/link";
import ShareEmailModal from "./ShareEmailModal";
import ChangeEmailPasswordModal from "./ChangeEmailPasswordModal";
import DomainSetupModal from "./DomainSetupModal";

interface Props {
  emailUser: IEmailUser;
  onChange: () => void;
  config: { defaultDomainName: string } | null | undefined;
}

const EmailUserCard: FC<Props> = ({ emailUser, onChange, config }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDomainSetupModalOpen, setIsDomainSetupModalOpen] = useState(false);
  const [deleteUser] = createEmailUserAPI.useDeleteEmailUserMutation();
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [currentPassword, setCurrentPassword] = useState(emailUser.password);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailUser.email);
      showSuccessToast({ title: "Copied to clipboard" });
    } catch (err) {
      console.error(err);
      showErrorToast("Unable to copy");
    }
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(currentPassword);
      showSuccessToast({ title: "Copied to clipboard" });
    } catch (err) {
      console.error(err);
      showErrorToast("Unable to copy");
    }
  };

  const handleDelete = async () => {
    if (isLoading) {
      return;
    }
    const confirmation = prompt(
      `Are you sure you want to delete ${emailUser.email}? This action cannot be undone. Type DELETE to confirm.`
    );
    if (!confirmation) {
      return;
    }
    if (confirmation !== "DELETE") {
      alert("You must type DELETE to confirm.");
      return;
    }

    try {
      setIsLoading(true);

      await deleteUser({ emailUserId: emailUser._id });

      showSuccessToast({ title: "Email deleted " });

      onChange();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNameModalClose = () => {
    setIsShareModalOpen(false);
  };

  const handleChangePasswordModalClose = () => {
    setIsChangePasswordModalOpen(false);
  };

  const handleChangedPassword = (newPassword: string) => {
    setCurrentPassword(newPassword);
    setIsChangePasswordModalOpen(false);
  };

  const handleDomainSetupModalClose = () => {
    setIsDomainSetupModalOpen(false);
  };

  return (
    <div className="w-full rounded border border-black-light bg-white border-[#1b2e4b] hover:bg-gray-100">
      <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
        <Link
          href={config ? "https://" + config.defaultDomainName : ""}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center max-w-sm"
        >
          <PersonSVG className="text-black" />
          <h5 className="ml-3 mr-3 text-xl font-semibold text-black text-ellipsis overflow-hidden">
            {emailUser.firstName} {emailUser.lastName}
          </h5>
          <ArrowTopRightSVG className="text-black h-5 w-5" />
        </Link>
        <div className="pl-3 flex flex-col md:flex-row items-center w-4/6 justify-start md:justify-between">
          <div
            className="text-black flex items-center cursor-pointer"
            onClick={handleCopyEmail}
          >
            {emailUser.email}
            <CopySVG className="ml-2 h-4 w-4" />
          </div>
          <div
            className="text-black flex items-center"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex">
              {isPasswordHidden ? (
                <div className="relative top-1">************</div>
              ) : (
                currentPassword
              )}
            </div>
            <div
              className="ml-2 cursor-pointer"
              onClick={e => setIsPasswordHidden(!isPasswordHidden)}
            >
              {isPasswordHidden ? (
                <EyeSlashSVG className="h-4 w-4" />
              ) : (
                <EyeSVG className="h-4 w-4" />
              )}
            </div>
            <div className="ml-2 cursor-pointer" onClick={handleCopyPassword}>
              <CopySVG className="h-4 w-4" />
            </div>
          </div>
          <div
            className="dropdown mr-3 flex justify-end"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Dropdown
              offset={[0, 5]}
              placement={"bottom-end"}
              button={<DotsSVG className={`h-5 w-5 text-gray-500`} />}
            >
              <ul
                className="w-48"
                style={{
                  backgroundColor: "white",
                  color: "black",
                }}
              >
                {config &&
                  !emailUser.email.endsWith("@" + config.defaultDomainName) && (
                    <li>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setIsDomainSetupModalOpen(true)}
                        className="flex items-center"
                      >
                        <div className="scale-75 mr-1">
                          <HelpRaftSVG className="h-6 w-6" />
                        </div>
                        Domain Setup
                      </button>
                    </li>
                  )}
                <li>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="flex items-center"
                  >
                    <div className="scale-75 mr-1">
                      <LockClosedSVG className="h-6 w-6" />
                    </div>
                    Reset Password
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center"
                  >
                    <div className="scale-75 mr-1">
                      <ShareSVG />
                    </div>
                    Share Credentials
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleDelete}
                    className="flex items-center"
                  >
                    <div className="scale-75 mr-1">
                      <TrashSVG />
                    </div>
                    Delete Account
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>
      </div>
      <ShareEmailModal
        emailUserId={emailUser._id}
        emailUserEmail={emailUser.email}
        isOpen={isShareModalOpen}
        onRequestClose={handleNewNameModalClose}
        onEmailShared={handleNewNameModalClose}
      />
      <ChangeEmailPasswordModal
        emailUserId={emailUser._id}
        emailUserEmail={emailUser.email}
        isOpen={isChangePasswordModalOpen}
        onRequestClose={handleChangePasswordModalClose}
        onPasswordChanged={handleChangedPassword}
      />
      {emailUser.domain && (
        <DomainSetupModal
          config={config}
          domainId={emailUser.domain}
          isOpen={isDomainSetupModalOpen}
          onRequestClose={handleDomainSetupModalClose}
        />
      )}
    </div>
  );
};

export default EmailUserCard;
