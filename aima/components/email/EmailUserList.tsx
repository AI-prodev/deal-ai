import React, { FC } from "react";
import { IEmailUser } from "@/interfaces/IEmailUser";
import EmailUserCard from "./EmailUserCard";
import { createEmailUserAPI } from "@/store/features/emailUserApi";

interface Props {
  emalUsers: IEmailUser[];
  onChange: () => void;
}

const EmailUserList: FC<Props> = ({ emalUsers, onChange }) => {
  const { data: config } = createEmailUserAPI.useGetConfigQuery({});

  return (
    <div className="grid gap-4 grid-cols-1 w-full">
      {emalUsers.map(emalUser => (
        <EmailUserCard
          key={emalUser._id}
          emailUser={emalUser}
          onChange={onChange}
          config={config}
        />
      ))}
    </div>
  );
};

export default EmailUserList;
