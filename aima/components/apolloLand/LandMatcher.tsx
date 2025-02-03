import React, { useState, useEffect, Fragment, useRef } from "react";
import { ThesisData } from "@/interfaces/ThesisData";
import { Dialog, Transition, Tab } from "@headlessui/react";
import Flag from "react-world-flags";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

import { apolloLandApi } from "@/store/features/apolloLandApi";
import { allowedCountries, countryCodes } from "@/utils/data/Countries";
import ApolloLandRecommends from "./ApolloLandRecommends";
import PropertySellForm from "../Seller/PropertySellForm";
import MatcherData from "./MatcherData";
import LandMatcherData from "./MatcherData";
import LoadingAnimation from "../LoadingAnimation";

interface ThesisProps {
  thesis: ThesisData | null;
  minAskingPrice: number | null;
  maxAskingPrice: number | null;
  countries: string[] | null;
  states: string[] | null;
  potentialDuplicates: boolean;
  exclusive?: boolean;
  combine?: boolean;
}

interface LandData {
  sellerId: string;
  id: string;
  score: number;
  listingHeadline: string;
  askingPrice: number;
  location: string;
  acres: number;
  about: string;
  URL: string;
  country: string;
  domain: number;
  RefreshUpdated: number;
  dateFounded: number;
  origin?: string;
  sellerEmail?: string;
  sellerFirstName?: string;
  sellerLastName?: string;
  type?: string;
}

const LandMatcher: React.FC<ThesisProps> = thesis => {
  function getISOAlpha2Code(country: string): string | undefined {
    const formattedCountry = country.trim().toLowerCase();
    const countryCode = countryCodes.find(
      c => c.name.toLowerCase() === formattedCountry
    );

    return countryCode?.code;
  }

  const retryToast = (color: string, retryCount: number) => {
    const toast = Swal.mixin({
      toast: true,
      position: "bottom-start",
      showConfirmButton: false,
      timer: 3000,
      showCloseButton: true,
      customClass: {
        popup: `color-${color}`,
      },
    });
    toast.fire({
      title: `API error. Retrying in 3 seconds. Retry count: ${retryCount}`,
    });
  };

  const [prevMinAskingPrice, setPrevMinAskingPrice] = useState<number | null>(
    null
  );
  const [prevMaxAskingPrice, setPrevMaxAskingPrice] = useState<number | null>(
    null
  );
  const [prevCountries, setPrevCountries] = useState<string[] | null>(null);
  const [prevStates, setPrevStates] = useState<string[] | null>(null);
  const [results, setResults] = useState<Array<LandData>>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "completed">(
    "idle"
  );
  const [token, setToken] = useState<string>("");
  const [modal1, setModal1] = useState(false);
  const [limit, setLimit] = useState(10);
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [isFetching, setIsFetching] = useState(false);
  const [prevPotentialDuplicates, setPrevPotentialDuplicates] = useState<
    boolean | null
  >(null);
  const [selectedDetailLand, setSelectedDetailLand] = useState<string>();
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  const updateRationale = (id: string, rationale: string) => {
    setRationales(prevRationales => ({
      ...prevRationales,
      [id]: rationale,
    }));
  };

  //Get Token for Authorization
  const { data: session } = useSession();

  const handleShowDetail = (id?: string) => {
    if (id) {
      setSelectedDetailLand(id);
      setDetailModalOpen(true);
    }
  };

  const api = apolloLandApi();
  const { useQueryRequestMutation, useEndRequestMutation } = api;

  const [queryRequest, { isLoading: isQueryRequestLoading }] =
    useQueryRequestMutation();
  const [endRequest, { isLoading: isEndRequestLoading }] =
    useEndRequestMutation();
  const [startMatch, { isLoading: startMatchLoading, error: startMatchError }] =
    api.useStartMatchMutation();

  const [
    startMatchExclusive,
    { isLoading: startMatchExclusiveLoading, error: startMatchExclusiveError },
  ] = api.useStartApolloMatchPropertyExclusiveMutation();

  const updateProgress = async (tok: string, origin: string) => {
    if (status === "completed") return;

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;
    let resultsSet = false;
    let filteredBusinessData: LandData[] = [];
    setStatus("loading");

    while (!success && ++retryCount <= maxRetries) {
      try {
        const res = (await queryRequest({ token: tok })) as {
          data: any;
        };

        const data = res?.data;

        if (data?.progress !== undefined) {
          await new Promise(res => setTimeout(res, 10000));
          continue;
        }

        if (data?.status === "error") {
          setModal1(true);
          return;
        }

        if (data?.status === "completed" && !resultsSet) {
          const endRes = (await endRequest({ token: tok })) as {
            data: any;
          };
          const endData = endRes?.data;

          if (!endData?.response) {
            setModal1(true);
            return;
          }

          const results = endData.response;
          const matches = results.matches;

          const parsedMatches = matches.map((match: any) => ({
            id: match.id,
            score: match.score,
            askingPrice: match.metadata.askingPrice,
            dateFounded: match.metadata.dateFounded,
            listingHeadline: match.metadata.listingHeadline,
            location: match.metadata.location,
            country: match.metadata.Country,
            domain: match.metadata.domain,
            refreshUpdated: match.metadata.RefreshUpdated,

            acres: match.metadata.acres,
            about: match.metadata.about,
            URL: match.metadata.URL,
            sellerEmail: match.metadata?.sellerEmail,
            sellerFirstName: match.metadata?.sellerFirstName,
            sellerLastName: match.metadata?.sellerLastName,
            origin: origin,
            type: match.metadata?.type,
          }));

          const filteredBusinessData: LandData[] = [];
          const seenListingHeadlines = new Set<string>();

          const allowedCountriesMap = new Map(
            allowedCountries.map(country => [country.name.toLowerCase(), true])
          );

          parsedMatches.forEach((business: LandData) => {
            if (business.country == "US") {
              business.country = "United States";
            }

            const countryName = business.country;

            const listingHeadline = business.listingHeadline;

            const isDuplicate = seenListingHeadlines.has(listingHeadline);

            if (thesis.potentialDuplicates && isDuplicate) {
              return;
            }

            const isCountryMatch = allowedCountriesMap.has(
              countryName.toLowerCase()
            );

            if (isCountryMatch) {
              filteredBusinessData.push(business);
              seenListingHeadlines.add(listingHeadline);
            }
          });

          // setResults(filteredBusinessData);
          // resultsSet = true;
          // success = true;
          resultsSet = true;
          success = true;
          if (success) {
            return filteredBusinessData || [];
          }
        }
      } catch (err) {
        console.error(err);
        retryToast("warning", retryCount);
        await new Promise(res => setTimeout(res, 3000));
      }
    }
    return filteredBusinessData || [];
  };
  const tokens: { token: string; origin: string }[] = [];
  const fireQuery = async (theThesis: ThesisData) => {
    setIsFetching(true);
    //if (!debug) await new Promise((res) => setTimeout(res, 6000));
    let thesisWithMinMaxAskingPriceAndCountries;
    setStatus("loading");
    if (
      thesis.maxAskingPrice !== null &&
      thesis.minAskingPrice !== null &&
      thesis.countries !== null &&
      thesis.states !== null
    ) {
      thesisWithMinMaxAskingPriceAndCountries = {
        ...theThesis,
        maxAskingPrice: +thesis.maxAskingPrice,
        minAskingPrice: +thesis.minAskingPrice,
        countries: thesis.countries,
        states: thesis.states,
      };
    }

    if (thesisWithMinMaxAskingPriceAndCountries) {
      setStatus("idle");
    }
    try {
      const updatePromises = [];

      if (thesis.exclusive || thesis.combine) {
        const exclusiveData = await startMatchExclusive(
          thesisWithMinMaxAskingPriceAndCountries
            ? thesisWithMinMaxAskingPriceAndCountries
            : theThesis
        ).unwrap();

        tokens.push({
          token: exclusiveData.token,
          origin: "exclusive",
        });
        updatePromises.push(updateProgress(exclusiveData.token, "exclusive"));
      }

      if (!thesis.exclusive || thesis.combine) {
        const nonExclusiveData = await startMatch(
          thesisWithMinMaxAskingPriceAndCountries
            ? thesisWithMinMaxAskingPriceAndCountries
            : theThesis
        ).unwrap();

        tokens.push({
          token: nonExclusiveData.token,
          origin: "non-exclusive",
        });
        updatePromises.push(
          updateProgress(nonExclusiveData.token, "non-exclusive")
        );
      }
      //@ts-ignore
      const allResults: LandData[][] = await Promise.all(updatePromises);

      const combinedResults: LandData[] = allResults
        .flat()
        .sort((a: LandData, b: LandData) => b.score - a.score);
      setStatus("completed");
      setResults(combinedResults);
      // setTimeout(async () => updateProgress(data.token, true), 2000);
    } catch (err) {
      console.error(err);
      // Handle error here, e.g., show a toast message
    }
    setIsFetching(false);
  };
  const fireQueryRef = useRef(false);

  useEffect(() => {
    if (thesis == null) return;
    if (thesis.thesis == null) return;

    if (status === "idle" && !fireQueryRef.current) {
      fireQueryRef.current = true;
      fireQuery(thesis.thesis);
    }
  }, [thesis.thesis, status]);
  useEffect(() => {
    if (thesis == null) return;
    if (thesis.thesis == null) return;

    let minMaxAskingPriceChanged = false;

    if (
      prevMinAskingPrice !== thesis.minAskingPrice ||
      prevMaxAskingPrice !== thesis.maxAskingPrice
    ) {
      fireQueryRef.current = false;
      minMaxAskingPriceChanged = true;
      setPrevMinAskingPrice(thesis.minAskingPrice);
      setPrevMaxAskingPrice(thesis.maxAskingPrice);
    }

    if (
      minMaxAskingPriceChanged ||
      JSON.stringify(prevCountries) !== JSON.stringify(thesis.countries) ||
      JSON.stringify(prevStates) !== JSON.stringify(thesis.states)
    ) {
      setStatus("idle");
      if (!minMaxAskingPriceChanged) {
        fireQueryRef.current = false;
        setPrevCountries(thesis.countries);
        setPrevStates(thesis.states);
      }
    }
  }, [
    thesis.minAskingPrice,
    thesis.maxAskingPrice,
    thesis.countries,
    thesis.states,
    prevMinAskingPrice,
    prevMaxAskingPrice,
    prevCountries,
    prevStates,
  ]);

  useEffect(() => {
    if (
      prevPotentialDuplicates !== null &&
      thesis.potentialDuplicates !== prevPotentialDuplicates
    ) {
      setStatus("idle");
      fireQueryRef.current = false;
    }
    setPrevPotentialDuplicates(thesis.potentialDuplicates);
  }, [thesis.potentialDuplicates, prevPotentialDuplicates]);

  const handleCloseModal = () => {
    setDetailModalOpen(false);
  };
  return (
    <div>
      {selectedDetailLand && (
        <>
          <PropertySellForm
            mode="show"
            isOpen={isDetailModalOpen}
            onRequestClose={handleCloseModal}
            selectedPropertySeller={{ id: selectedDetailLand }}
            showOnly
            // onRefetch={refetch}
          />
        </>
      )}
      <div className="mb-5">
        <Transition appear show={modal1} as={Fragment}>
          <Dialog as="div" open={modal1} onClose={() => setModal1(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0" />
            </Transition.Child>
            <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
              <div className="flex min-h-screen items-start justify-center px-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel
                    as="div"
                    className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                  >
                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                      <div className="text-lg font-bold">Error</div>
                      <button
                        type="button"
                        className="text-white-dark hover:text-dark"
                        onClick={() => setModal1(false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="p-5">
                      <p>
                        On this occasion, it was not possible to generate your
                        theses. As alpha software, this sometimes happens,
                        please accept our apologies!
                      </p>
                      <p>
                        We have automatically notified our development team, and
                        they'll get to work on fixing it right away.
                      </p>
                      <p>Let's try again!</p>
                      <div className="mt-8 flex items-center justify-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => {
                            setModal1(false);
                            if (thesis?.thesis) fireQuery(thesis.thesis);
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      {status === "loading" && (
        <div>
          <LoadingAnimation width={50} height={50} />
          {/* <span className="m-auto mb-10 inline-block h-12 w-12 animate-spin rounded-full border-4 border-success border-l-transparent align-middle"></span> */}
        </div>
      )}
      {status === "completed" && results.length == 0 && (
        <div className="text-center text-gray-500">
          <p className="text-lg">No matching results found</p>
          <p className="mt-2">Please try a different filter criteria.</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          {results.slice(0, limit).map((result, index) => {
            let origin = window.location.origin;
            if (result.URL.includes("/broker-property?detail=")) {
              if (origin) {
                result.URL = result.URL.replace(origin, "");

                result.URL = origin + result.URL;
              }
            }
            return (
              <div
                key={index}
                className="mb-5 flex w-full items-center justify-center"
              >
                <LandMatcherData
                  result={result}
                  thesis={thesis.thesis}
                  handleShowDetail={handleShowDetail}
                />
              </div>
            );
          })}
          {limit + 10 <= results.length && (
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => {
                setLimit(limit => limit + 10);
              }}
            >
              Show more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LandMatcher;
