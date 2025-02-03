import React, { useEffect } from "react";
import Editor from "@/components/puckeditor";
import { useDispatch } from "react-redux";
import { toggleTheme } from "@/store/themeConfigSlice";
import Head from "next/head";

const PreviewSmartWebsites = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleTheme("dark"));
  }, []);

  return (
    <div className="bg-white">
      <Head>
        <title>Simple Websites</title>
      </Head>
      <Editor />
    </div>
  );
};

PreviewSmartWebsites.getLayout = (page: any) => {
  return <div className="bg-white">{page}</div>;
};
export default PreviewSmartWebsites;
