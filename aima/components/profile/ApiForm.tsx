import React, { useEffect, useState } from "react";
import crypto from "crypto";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import { createProfileAPI } from "@/store/features/profileApi";

interface ApiKeyProps {
  userID: string;
}

const ApiForm: React.FC<ApiKeyProps> = ({ userID }) => {
  const profileApiClient = createProfileAPI;

  const {
    data: apiKeyData,
    isLoading: isFetchingApiKey,
    refetch: refetchApiKey,
  } = profileApiClient.useGetApiKeyQuery(undefined, {
    skip: false,
  });

  const [changeApiKey, { isLoading: isChangingApiKey }] =
    profileApiClient.useChangeApiKeyMutation();

  const handleApiKeyChange = async () => {
    try {
      await changeApiKey().unwrap();
      showSuccessToast({ title: "API Key changed successfully!" });
      refetchApiKey(); // Refetch the API key
    } catch (error) {
      showErrorToast("Failed to change API key!");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    refetchApiKey();
  }, [refetchApiKey]);

  return (
    <div className="mt-10 md:w-1/2">
      <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
        API Key Management
      </h5>

      <p>
        Your API key allows you to integrate deal.ai apps with other services.
        Use the Copy button to add the key to the right places in the
        integration.
      </p>

      <div className="mt-4">
        <div className="flex items-center">
          <input
            type="text"
            value={apiKeyData?.apiKey || ""}
            id="apiKey"
            className="form-input mr-2"
            disabled
          />
          <button
            onClick={() => copyToClipboard(apiKeyData?.apiKey || "")}
            className="btn btn-secondary"
          >
            Copy
          </button>
        </div>
      </div>

      <p className="mt-4">
        If someone else has become aware of your key, you should change it
        immediately using the button below. You will then need to visit your
        integrations and replace with the new API key.
      </p>

      <div className="mt-4">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleApiKeyChange}
          disabled={isChangingApiKey || isFetchingApiKey}
        >
          {isChangingApiKey ? <LoadingSpinner isLoading /> : "Change API Key"}
        </button>
      </div>
    </div>
  );
};

export default ApiForm;
