import { BriefcaseSVG, CloudSVG } from "@/components/icons/SVGData";
import ProposalForm from "@/components/proposals/ProposalForm";
import ProposalItem from "@/components/proposals/ProposalItem";
import withAuth from "@/helpers/withAuth";
import { IProposal } from "@/interfaces/IProposal";
import { createFileAPI } from "@/store/features/fileApi";
import { createProposalAPI } from "@/store/features/proposalApi";
import { USER_ROLES } from "@/utils/roles";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const QUERY_LIMIT = 10;

const Proposals = () => {
  const IS_LIGHT_MODE = true;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [offsetProposalId, setOffsetProposalId] = useState<string>("");
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: fetchedPropsals,
    isFetching: isFetchingProposals,
    isLoading: isLoadingProposals,
    refetch: refetchProposals,
  } = createProposalAPI.useGetMyProposalsQuery({
    limit: QUERY_LIMIT,
    offsetProposalId,
  });

  const { data: proposalFolder } = createFileAPI.useGetFolderByNameQuery({
    folderName: "Marketing Proposals",
  });

  useEffect(() => {
    if (fetchedPropsals) {
      setProposals(prev => [
        ...prev,
        ...fetchedPropsals.filter(c => !prev.find(p => p._id === c._id)),
      ]);
      if (fetchedPropsals.length < QUERY_LIMIT) {
        setHasMore(false);
      }
    }
  }, [fetchedPropsals]);

  const resetProposalList = () => {
    setOffsetProposalId("");
    setProposals([]);
    refetchProposals();
  };

  const handleLoadMore = () => {
    setOffsetProposalId(proposals ? proposals[proposals.length - 1]._id : "");
  };

  if (!isClient) {
    return <></>;
  }

  return (
    <div className="relative px-0 md:px-3 w-full flex justify-center">
      {IS_LIGHT_MODE && (
        <Head>
          <title>AI Marketing Proposals</title>
          <style>
            {`
														body {
																background-color: white !important;
														}
												`}
          </style>
        </Head>
      )}
      <div className="w-full max-w-3xl">
        <div className="flex flex-col md:flex-row items-center pt-2 w-full justify-between">
          <div className="flex flex-col justify-center items-center md:items-start">
            <div className="flex items-center">
              <BriefcaseSVG
                className={`h-6 w-6 ${IS_LIGHT_MODE && "text-black"}`}
              />
              <h2
                className={`ml-3 text-2xl font-bold ${IS_LIGHT_MODE && "text-black"}`}
              >
                AI Marketing Proposals
              </h2>
            </div>
          </div>
        </div>
        <div className={`mt-6 ${proposalFolder ? "mb-4" : "mb-6"}`}>
          <ProposalForm onProposalCreated={resetProposalList} />
        </div>
        {proposalFolder && (
          <div className="w-full text-right mb-2">
            <Link
              href={`/apps/vault/${proposalFolder._id}`}
              className="text-blue-500 hover:underline"
            >
              Vault Proposals Folder
            </Link>
          </div>
        )}
        <div className="">
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr className="text-black bg-[#eeeeee]">
                  <th className="px-4 py-2 bg-[#eeeeee]">Business Name</th>
                  <th className="px-4 py-2 bg-[#eeeeee]">Website</th>
                  <th className="px-4 py-2 bg-[#eeeeee]">DOC</th>
                  <th className="px-4 py-2 bg-[#eeeeee]">PDF</th>
                  <th className="px-4 py-2 bg-[#eeeeee]">Created</th>
                  <th className="px-4 py-2 bg-[#eeeeee] text-center">Redo</th>
                </tr>
              </thead>
              <tbody>
                {proposals?.map(proposal => (
                  <ProposalItem key={proposal._id} proposal={proposal} />
                ))}
              </tbody>
            </table>
            {proposals.length > 0 && hasMore && (
              <div className="w-full flex items-center justify-center mt-6">
                <button
                  className="rounded border border-primary bg-white px-3 py-1 text-primary text-sm"
                  onClick={handleLoadMore}
                >
                  {isFetchingProposals ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
            {!isLoadingProposals &&
              !isFetchingProposals &&
              proposals &&
              proposals.length === 0 && (
                <div className="w-full my-12 flex flex-col items-center justify-center text-gray-400">
                  <CloudSVG
                    className="h-16 w-16 text-gray-300"
                    strokeWidth={2}
                  />
                  <h2>No proposals yet</h2>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Proposals, USER_ROLES, "ai-platform");
