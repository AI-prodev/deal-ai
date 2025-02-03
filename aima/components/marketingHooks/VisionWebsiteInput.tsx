import { showErrorToast } from "@/utils/toast";
import React, { useEffect, useRef, useState } from "react";

interface VisionWebsiteInputProps {
  startWebRequest: (data: { input: { url: string } }) => Promise<any>;
  queryWebRequest: (token: any) => Promise<any>;
  endWebRequest: (token: any) => Promise<any>;
  handleEndResponse: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const VisionWebsiteInput: React.FC<VisionWebsiteInputProps> = ({
  startWebRequest,
  queryWebRequest,
  endWebRequest,
  handleEndResponse,
  isLoading,
  setIsLoading,
}) => {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const trackingInProgress = useRef(false);
  useEffect(() => {
    const savedToken = localStorage.getItem("websiteAnalysisToken");
    if (savedToken) {
      setToken(savedToken);
      trackProgress(savedToken);
    }
  }, []);

  const formatAndValidateUrl = (inputUrl: string) => {
    if (!inputUrl) return { isValid: false, formattedUrl: "" };

    let formattedUrl = inputUrl;
    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      formattedUrl = "https://" + inputUrl;
    }

    if (!formattedUrl.includes(".")) {
      return { isValid: false, formattedUrl: "" };
    }

    try {
      new URL(formattedUrl);
      return { isValid: true, formattedUrl };
    } catch (error) {
      return { isValid: false, formattedUrl: "" };
    }
  };

  const trackProgress = async (token: string) => {
    if (trackingInProgress.current) {
      return; // Prevent multiple invocations
    }

    trackingInProgress.current = true;

    let completed = false;
    let delay = 2000;
    const maxDelay = 30000;

    setIsLoading(true);

    while (!completed) {
      try {
        const statusResult = await queryWebRequest({ token });
        if (statusResult.data.status === "completed") {
          completed = true;

          const endResult = await endWebRequest({ token });
          handleEndResponse(endResult);
          setIsLoading(false);
          localStorage.removeItem("websiteAnalysisToken");
        } else if (statusResult.data.status === "error") {
          completed = true;
          showErrorToast("Error analyzing website! Please try again.");
          localStorage.removeItem("websiteAnalysisToken");
          setIsLoading(false);
        } else {
          delay = Math.min(delay * 1.5, maxDelay);
        }
      } catch (error) {
        setIsLoading(false);
        completed = true;
        localStorage.removeItem("websiteAnalysisToken");
      }
      if (completed) {
        trackingInProgress.current = false;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    setIsLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const { isValid, formattedUrl } = formatAndValidateUrl(url);

    if (!isValid) {
      showErrorToast("Please enter a valid URL.");
      return;
    }
    try {
      const startResponse = await startWebRequest({
        input: { url: formattedUrl },
      });
      if (startResponse.data.token) {
        localStorage.setItem("websiteAnalysisToken", startResponse.data.token);
        setToken(startResponse.data.token);
        trackProgress(startResponse.data.token);
      }
    } catch (error) {
      showErrorToast("Error starting web request. Please try again.");
      console.error("Error starting web request:", error);
    }
  };

  return (
    <div className="mt-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col md:flex-row"
      >
        <div className="relative my-2 px-2 md:my-0 md:w-3/5 md:px-0">
          <input
            type="text"
            className="form-input w-full rounded border border-gray-300 p-2 text-black"
            placeholder="Enter website URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          {isLoading && (
            <div className="absolute top-0 right-0 flex h-full items-center pr-3">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className=" disabled:bg-grey-400 mx-2 rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Analyze Website
        </button>
      </form>
    </div>
  );
};

export default VisionWebsiteInput;
