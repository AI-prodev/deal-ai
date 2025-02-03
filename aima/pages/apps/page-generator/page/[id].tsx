import React, { useState } from "react";
import BlankLayout from "@/components/Layouts/BlankLayout";
import { useRouter } from "next/router";
import Hero from "@/components/pageGenerator/sections/Hero";
import Newsletter from "@/components/pageGenerator/sections/Newsletter";
import Features from "@/components/pageGenerator/sections/Features";
import Testimonials from "@/components/pageGenerator/sections/Testimonials";
import Footer from "@/components/pageGenerator/sections/Footer";
import Team from "@/components/pageGenerator/sections/Team";
import Pricing from "@/components/pageGenerator/sections/Pricing";
import FAQ from "@/components/pageGenerator/sections/FAQ";
import SocialProof from "@/components/pageGenerator/sections/SocialProof";
import Intro from "@/components/pageGenerator/sections/Intro";
import { createPageApi } from "@/store/features/pageApi";
import Head from "next/head";

type PageFields = {
  hero_text: string;
  follow_up: string;
};

const GeneratedPage = () => {
  const { query } = useRouter();
  const pageId = query.id as string;
  const pageApiClient = createPageApi;
  const {
    data: pageData,
    isLoading,
    isError,
    isSuccess,
    error,
  } = pageApiClient.useGetPageQuery({ pageId });

  if (!pageData || !pageData.fields) {
    return <></>;
  }

  return (
    <>
      <Head>
        <title>Sample Page</title>
      </Head>
      <Hero title={pageData.fields.hero_text} />
      <SocialProof />
      <Intro introText={pageData.fields.follow_up} />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Team />
      <Newsletter />
      <Footer />
    </>
  );
};
GeneratedPage.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default GeneratedPage;
