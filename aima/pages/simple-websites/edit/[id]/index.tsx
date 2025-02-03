import Editor from "@/components/puckeditor";
import React, { useEffect } from "react";
import Header from "@/components/Layouts/Header";
import BlankLayout from "@/components/Layouts/BlankLayout";
import { useDispatch } from "react-redux";
import { toggleTheme } from "@/store/themeConfigSlice";
import Head from "next/head";
import { getSession } from "next-auth/react";

const EditSmartWebsites = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(toggleTheme("dark"));

    getSession().then(session => {
      if (session?.token) {
        localStorage.setItem("sessionToken", session.token);
      }
    });
  }, []);

  return (
    <div className="bg-white">
      <Head>
        <title>Simple Websites</title>
      </Head>
      <Editor isEditMode />
    </div>
  );
};

EditSmartWebsites.getLayout = (page: any) => {
  return (
    <BlankLayout>
      <Header />
      {page}
    </BlankLayout>
  );
};

export default EditSmartWebsites;
