"use client";

import { ThemeProvider, createTheme } from "@mui/material";
import { Data, Puck, Render, Config } from "@measured/puck";
import "@measured/puck/puck.css";
import conf, { initialData, viewports } from "./config";
import { baseUrl } from "@/utils/baseUrl";
import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import generateHTML from "./generate-html";
import { showSuccessToast } from "@/utils/toast";
import HeaderActions from "./overrides/HeaderActions";
import Fields from "./overrides/Fields";
import { getSession } from "next-auth/react";

interface IEditorProps {
  isEditMode?: boolean;
}

const Editor: FC<IEditorProps> = ({ isEditMode = false }) => {
  const { query } = useRouter();
  const [data, setData] = useState<Data>(initialData);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isPublish, setIsPublish] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const pageId = query?.id as string;
  const funnelId = query?.funnel as string;
  const pagePath = query?.pagePath as string;

  const muiTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  useEffect(() => {
    if (pageId) getValues(pageId);
  }, [pageId]);

  const getValues = async (pageId: string) => {
    setIsLoading(true);
    const session = await getSession();

    const response = await fetch(`${baseUrl}/pages/${pageId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token}`,
      },
    });
    const page = await response.json();
    if (!page.jsonUrl) {
      setIsLoading(false);
      setTimeout(() => {
        setHasInitialized(true);
      }, 700);
      return;
    }

    const data = await fetch(page.jsonUrl);
    if (!data) {
      setIsLoading(false);
      setTimeout(() => {
        setHasInitialized(true);
      }, 700);
      return;
    }
    const jsonContent = await data.json();
    if (!jsonContent) {
      setIsLoading(false);
      setTimeout(() => {
        setHasInitialized(true);
      }, 700);
      return;
    }

    setData(jsonContent);
    setIsLoading(false);
    setTimeout(() => {
      setHasInitialized(true);
    }, 700);
  };

  const handelSave = async (data: Data) => {
    setIsPublishLoading(true);
    const sessionToken = localStorage.getItem("sessionToken");
    const html = await generateHTML(data);

    const response = await fetch(`${baseUrl}/pages/${pageId}/save`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        html,
        json: data,
      }),
    });

    if (response?.ok) {
      setIsPublishLoading(false);
      setIsPreview(true);
      setIsPublish(false);
      showSuccessToast({
        title: "Published successfully",
        showCloseButton: false,
      });
    }
  };

  const handleChange = () => {
    if (hasInitialized) {
      setIsPreview(false);
      setIsPublish(true);
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      {isEditMode && isLoading && (
        <Puck
          config={conf as Config}
          iframe={{ enabled: false }}
          data={initialData}
        />
      )}
      {isEditMode && !isLoading && (
        <Puck
          config={conf as Config}
          onChange={handleChange}
          iframe={{ enabled: false }}
          data={data}
          overrides={{
            headerActions: () => (
              <HeaderActions
                isPublish={isPublish}
                isPublishLoading={isPublishLoading}
                isPreview={isPreview}
                funnelId={funnelId || ""}
                pagePath={pagePath || ""}
                onPublish={handelSave}
              />
            ),
            fields: Fields,
          }}
        />
      )}
      {!isEditMode && <Render config={conf as Config} data={data} />}
    </ThemeProvider>
  );
};

export default Editor;
