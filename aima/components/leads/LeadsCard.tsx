import React, { useState } from "react";
import { countryCodes } from "@/utils/data/Countries";
import Flag from "react-world-flags";
import { AskingPriceSVG } from "../apollo/Svg/SvgData";
import {
  useDeleteLeadMutation,
  useReportLeadMutation,
} from "@/store/features/leadsApi";
import { showSuccessToast } from "@/utils/toast";
import Swal from "sweetalert2";
import { timeAgo } from "@/utils/timeAgo";
import {
  BuildingSVG,
  ClockSVG,
  CountrySVG,
  PersonSVG,
  SquareDoubleAltArrowUp,
} from "@/components/icons/SVGData";

interface BusinessData {
  sellerId: string;
  id: string;
  score: number;
  askingPrice: number;
  dateFounded: number;
  listingHeadline: string;
  location: string;
  totalProfitAnnual: number;
  totalRevenueAnnual: number;
  URL: string;
  about: string;
  franchise?: boolean;
  entityName?: string;
  entityType?: string;
  ownershipStructure?: string;
  liabilities?: string;
  platformBusiness?: boolean;
  assetsIncluded?: string;
  sellerContinuity?: boolean;
  origin?: string;
  sellerEmail?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
  location2?: string;
}

function getISOAlpha2Code(country: string): string | undefined {
  const formattedCountry = country.trim().toLowerCase();
  const countryCode = countryCodes.find(
    c => c.name.toLowerCase() === formattedCountry
  );

  return countryCode?.code;
}
type DataWithFavoriteId = BusinessData & { _id: string };
type FavoriteState = DataWithFavoriteId[];
interface MatcherDataProps {
  lead: any;
  refetchLeads: Function;
  isAdmin?: boolean;
}

const LeadsCard: React.FC<MatcherDataProps> = ({
  lead,
  refetchLeads,
  isAdmin,
}) => {
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [reportLead, { isLoading: isReportLoading, isSuccess, isError }] =
    useReportLeadMutation();

  const handleDeleteLead = async (id: string) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-secondary",
        cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
        popup: "sweet-alerts",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Leads cannot be recovered once deleted",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
        padding: "2em",
      })
      .then(async result => {
        if (result.value) {
          try {
            const data = await deleteLead(id);
            if (data) {
              showSuccessToast({
                title: "Lead deleted successfully",
              });
              refetchLeads();
            }
          } catch (error) {
            console.error(`Error deleting lead: ${error}`);
          }
        }
      });
  };

  const handleReport = async (reportData: { leadsId: string }) => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-secondary",
        cancelButton: "btn btn-dark ltr:mr-3 rtl:ml-3",
        popup: "sweet-alerts",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        text: "Report leads that are scams, spam, or inappropriate (e.g. adult themes). This will notify our team to review the lead. Continue?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
        padding: "2em",
      })
      .then(async result => {
        if (result.value) {
          try {
            const data = await reportLead(reportData).unwrap();
            if (data && data.message) {
              showSuccessToast({ title: data.message });
              refetchLeads();
            }
          } catch (error) {
            console.error("Error reporting lead:", error);
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "The report was not submitted.",
            "error"
          );
        }
      });
  };

  return (
    <>
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="flex justify-between px-6 pt-2 pb-7">
          <h5 className="mb-4 mt-4  text-xl font-semibold text-[#ffffff] dark:text-white-light">
            {lead.businessName === "<|UPGRADE|>" ? (
              <a
                className="block flex items-center justify-center rounded bg-primary py-1 px-3 text-sm font-bold text-white hover:bg-blue-700"
                href="https://deal.ai/leadsforagencies"
              >
                <div className="flex items-center justify-center">
                  <SquareDoubleAltArrowUp />{" "}
                  <span className="pl-2">View Business Name (Unlock)</span>
                </div>
              </a>
            ) : (
              <span>{lead.businessName}</span>
            )}
          </h5>
        </div>
        <div className="mb-5 flex items-center justify-center">
          <div className="w-full max-w-[36rem] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
            <div className="py-7 px-6">
              <div className="space-y-9">
                <div className="flex items-center">
                  <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                    <div className="grid h-9 w-9 place-content-center  rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
                      <CountrySVG />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex font-semibold text-white-dark">
                      <h6>Country</h6>
                      <p className="ltr:ml-auto rtl:mr-auto">
                        {" "}
                        {lead?.location?.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")}
                      </p>
                    </div>
                    <div className="mb-5 h-2 w-full rounded-full">
                      {getISOAlpha2Code(
                        lead?.location?.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
                      ) !== undefined && (
                        <Flag
                          code={getISOAlpha2Code(
                            lead?.location?.replace(
                              /[\u{1F1E6}-\u{1F1FF}]/gu,
                              ""
                            )
                          )}
                          height="48"
                          width="48"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {lead.monthlyMarketingBudget && (
                  <div className="flex items-center">
                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                      <div className="grid h-9 w-9 place-content-center  rounded-full bg-success text-secondary dark:bg-success dark:text-secondary-light">
                        <AskingPriceSVG />
                      </div>
                    </div>
                    <div className="flex-1 ">
                      <div className="mb-2 flex flex-col font-semibold text-white-dark md:flex-row">
                        <h6 className="ml-auto md:ml-0">
                          Monthly Marketing Budget
                        </h6>
                        <p className="ltr:ml-auto rtl:mr-auto">
                          {lead.monthlyMarketingBudget}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {lead.workingWithAgency && (
                  <div className="flex items-center">
                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                      <div className="grid h-9 w-9 place-content-center rounded-full bg-secondary text-secondary dark:bg-secondary dark:text-secondary-light">
                        <BuildingSVG />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex flex-col font-semibold text-white-dark md:flex-row">
                        <h6 className="ml-auto md:ml-0">
                          Currently Working With Agency
                        </h6>
                        <p className="ltr:ml-auto rtl:mr-auto">
                          {lead.workingWithAgency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {lead.businessEmail && (
                  <div className="flex items-center">
                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                      <div className="grid h-9 w-9 place-content-center  rounded-full bg-success text-secondary dark:bg-success dark:text-secondary-light">
                        <PersonSVG />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex flex-col font-semibold text-white-dark md:flex-row">
                        <h6 className="ml-auto md:ml-0">Business Email</h6>
                        <div className="ltr:ml-auto rtl:mr-auto">
                          {lead.businessEmail === "<|UPGRADE|>" ? (
                            <a
                              className="block flex items-center justify-center rounded bg-primary py-1 px-3 text-sm font-bold text-white hover:bg-blue-700"
                              href="https://deal.ai/leadsforagencies"
                            >
                              <div className="flex items-center justify-center">
                                <SquareDoubleAltArrowUp />{" "}
                                <span className="pl-2">
                                  View Email (Unlock)
                                </span>
                              </div>
                            </a>
                          ) : (
                            <a
                              className="text-blue-600 underline"
                              href={`mailto:${lead.businessEmail}`}
                            >
                              {lead.businessEmail}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {lead.createdAt && (
                  <div className="flex items-center">
                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                      <div className="grid h-9 w-9 place-content-center rounded-full bg-secondary text-secondary dark:bg-secondary dark:text-secondary-light">
                        <ClockSVG />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex font-semibold text-white-dark">
                        <h6>Added</h6>
                        <p className="ltr:ml-auto rtl:mr-auto">
                          {timeAgo(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mr-5 flex flex-col justify-center pt-4">
          <div className="mb-5 flex items-center justify-center px-6">
            <div className="grow rounded bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
              <div>
                <p className="text-large text-white">
                  <div>
                    <h6 className="mb-4 text-lg font-semibold text-[#3b3f5c] dark:text-white-light">
                      Business Description
                    </h6>
                    <p className="text-md mb-7 text-white-light">
                      {lead.businessDescription}
                    </p>
                    <h6 className="mb-4 text-lg font-semibold text-[#3b3f5c] dark:text-white-light">
                      Current Challenge
                    </h6>
                    <p className="text-md mb-4 text-white-light">
                      {lead.currentChallenges}
                    </p>
                  </div>
                </p>
              </div>
            </div>
          </div>

          {lead.businessName === "<|UPGRADE|>" ? (
            <a
              className=" btn btn-primary items-left my-2 mx-3 mt-3 w-1/2 justify-start rounded-lg  text-sm font-bold text-white "
              href="https://deal.ai/leadsforagencies"
              type="button"
            >
              <div className="flex items-center justify-center">
                <SquareDoubleAltArrowUp />{" "}
                <span className="pl-2">Visit Business Website (Unlock)</span>
              </div>
            </a>
          ) : (
            <button className="btn btn-primary rounded-kg my-2 mx-3 mt-3 md:w-1/4">
              <a
                className="text-white "
                href={lead.businessWebsite}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                Visit Website
              </a>
            </button>
          )}

          {lead.businessEmail === "<|UPGRADE|>" ? (
            <a
              className="btn btn-primary items-left my-2  mx-3 flex h-full w-1/2  justify-start rounded-lg text-sm font-bold text-white "
              href="https://deal.ai/leadsforagencies"
              type="button"
            >
              <div className="items-left flex justify-start">
                <SquareDoubleAltArrowUp />{" "}
                <span className="pl-2">Email Business (Unlock)</span>
              </div>
            </a>
          ) : (
            <button className="btn btn-primary rounded-kg my-2 mx-3 mt-3 md:w-1/4">
              <a className="text-white" href={`mailto:${lead.businessEmail}`}>
                Email Business
              </a>
            </button>
          )}
          <button
            type="button"
            className="btn btn-danger my-2 mx-3 mt-8 flex items-center justify-around  rounded-lg opacity-50 md:w-1/4"
            onClick={() =>
              handleReport({
                leadsId: lead._id,
              })
            }
          >
            Report Listing
          </button>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger my-2 mx-3 mt-3 flex items-center justify-around  rounded-lg opacity-50 md:w-1/4"
              onClick={() => handleDeleteLead(lead._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadsCard;
