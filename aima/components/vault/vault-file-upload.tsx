import React from "react";
type VaultFileUploadProp = {
  fileInputRef: React.RefObject<HTMLInputElement>;
};
const VaultFileUpload = ({ fileInputRef }: VaultFileUploadProp) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 w-full border border-transparent rounded-2xl overflow-hidden">
      <div className="p-6 py-12 flex flex-col items-start justify-center bg-gray-200">
        <h1 className="text-black text-xl font-extrabold">
          Enjoy 5TB of storage FREE with your deal.ai membership
        </h1>
        <h2 className="mt-4 text-black text-xs font-bold">
          As compared to:
          <br />
          Google Drive Free (15GB) - <i>99% less storage</i>
          <br />
          Google Drive Business (2TB) - <i>60% less storage</i>
          <br />
          Dropbox Free (2GB) - <i>99% less storage</i>
          <br />
          Dropbox Plus (2TB) - <i>60% less storage</i>
          <br />
          <button
            onClick={() => fileInputRef?.current?.click()}
            className="mt-4 rounded bg-primary px-4 py-2 text-white font-normal"
          >
            + Upload Files
          </button>
        </h2>
      </div>
      <div
        className="min-h-48"
        style={{
          background:
            "url(/assets/images/vault-banner.png) center / cover no-repeat",
        }}
      ></div>
    </div>
  );
};

export default VaultFileUpload;
