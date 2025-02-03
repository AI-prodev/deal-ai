import { PageData } from "@/pages/apps/page-generator";
import Link from "next/link";
import React, { useState } from "react";

export const PageResults = ({ pageData }: { pageData: PageData[] }) => {
  return (
    <>
      {pageData.length > 0 && (
        <>
          {pageData.map((page, genIndex) => (
            <React.Fragment key={genIndex}>
              <h1 className="my-4 mt-10 text-2xl font-bold">
                Your Page #{genIndex}
              </h1>
              <div className="flex w-full justify-center md:justify-start">
                <Link
                  href={`/apps/page-generator/page/${page.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Page
                </Link>
              </div>
            </React.Fragment>
          ))}
        </>
      )}
    </>
  );
};
