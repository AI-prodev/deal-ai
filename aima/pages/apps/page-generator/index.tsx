import PageGeneratorForms from "@/components/pageGenerator/Forms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useState } from "react";
import { PageResults } from "@/components/pageGenerator/PageResults";

export type PageData = { id: number };

type Props = {};

const PageGenerator = (props: Props) => {
  const [pageData, setPageData] = useState<PageData[]>([]);

  return (
    <div className="p-3">
      <div className="my-3 pt-2">
        <h2 className="mt-2 text-2xl font-bold">Page Generator 🪄</h2>
      </div>
      <div className="my-3 w-full justify-center pt-2 md:w-1/2 max-w-lg">
        <PageGeneratorForms setPageData={setPageData} pageData={pageData} />
      </div>
      <div className="w-full justify-center pt-2">
        <PageResults pageData={pageData} />
      </div>
    </div>
  );
};

export default withAuth(PageGenerator, USER_ROLES);
