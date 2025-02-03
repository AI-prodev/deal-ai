import React, { useEffect, useState } from "react";
import Link from "next/link";
import StarIcon from "../StarIcon";
import { countryCodes } from "@/utils/data/Countries";
import Flag from "react-world-flags";
import ApolloRecommends from "../ApolloRecommends";
import { ThesisData } from "@/interfaces/ThesisData";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "@/store/features/favoritesApi";
import RelevanceScore from "./RelevanceScore";
import AskingPrice from "./AskingPrice";
import { CountrySVG, FranchiseSVG } from "@/components/icons/SVGData";

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
  result: BusinessData;
  handleShowDetail: (id: string) => void;
  thesis: ThesisData | null;
  favData?: string;
  onRemoveFavorite?: (type: string) => void;
}

export function createBusinessObject(result: BusinessData) {
  const replaceAllChars = (str: string) =>
    str &&
    str
      .replaceAll('"', "")
      .replaceAll(/&nbsp;/g, " ")
      .replaceAll("&", "and")
      .replaceAll(/nbsp;/g, " ")
      .replaceAll("#", "");

  return JSON.stringify({
    about: replaceAllChars(result.about),
    name: replaceAllChars(result.listingHeadline),
    url: replaceAllChars(result.URL),
    location: replaceAllChars(result.location),
    price: result.askingPrice,
    entityName: result.entityName || "",
    entityType: result.entityType || "",
    ownershipStructure: result.ownershipStructure || "",
    liabilities: result.liabilities || "",
    platformBusiness: result.platformBusiness || false,
    assetsIncluded: result.assetsIncluded || "",
    sellerContinuity: result.sellerContinuity || false,
    email: result?.sellerEmail || "",
    firstName: result?.sellerFirstName || "",
    lastName: result?.sellerLastName || "",
  });
}
const MatcherData: React.FC<MatcherDataProps> = ({
  result,
  handleShowDetail,
  thesis,
  favData,
  onRemoveFavorite,
}) => {
  const [rationales, setRationales] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<FavoriteState>([]);
  const [addFavorite, { data: addFavoriteData, isLoading: isAdding }] =
    useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] =
    useRemoveFavoriteMutation();

  const getFavoriteIdFromState = (result: BusinessData): string | null => {
    const favorite = favorites.find(favorite => favorite.id === result.id);
    return favorite ? favorite._id : null;
  };

  const removeFromFavoritesInState = (result: BusinessData): void => {
    setFavorites(favorites.filter(favorite => favorite.id !== result.id));
  };

  const addToFavoritesInState = (
    dataWithFavoriteId: DataWithFavoriteId
  ): void => {
    setFavorites([...favorites, dataWithFavoriteId]);
  };

  const updateRationale = (id: string, rationale: string) => {
    setRationales(prevRationales => ({
      ...prevRationales,
      [id]: rationale,
    }));
  };

  const handleOnClickFav = async () => {
    if (favData || (result && !favData)) {
      const favoriteId = favData || getFavoriteIdFromState(result);

      if (favoriteId) {
        await removeFavorite({ favoriteId });
        removeFromFavoritesInState(result);
        onRemoveFavorite && onRemoveFavorite("apollo");
      } else {
        const data = {
          type: "apollo",
          data: { result, thesis },
        };
        await addFavorite({ data });
      }
    }
  };
  useEffect(() => {
    if (addFavoriteData) {
      addToFavoritesInState({
        ...result,
        ...thesis,
        _id: addFavoriteData._id,
      });
    }
  }, [addFavoriteData]);

  return (
    <>
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="mt-2 flex justify-end px-4">
          <StarIcon
            className=" h-10 w-10 "
            width={35}
            height={35}
            loading={isAdding || isRemoving}
            onClick={handleOnClickFav}
            isFav={favData ? true : false}
          />
        </div>

        <div className="flex justify-between px-6 pt-2 pb-7">
          <h5 className="mb-4  text-xl font-semibold text-[#ffffff] dark:text-white-light">
            {result.listingHeadline}
          </h5>
          {result.origin === "exclusive" && (
            <span className="badge  w-18 h-[45%] bg-primary text-center ">
              deal.ai Exclusive
            </span>
          )}
        </div>
        <div className="mb-5 flex items-center justify-center">
          <div className="w-full max-w-[36rem] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
            <div className="py-7 px-6">
              <div className="space-y-9">
                <RelevanceScore score={result.score} />
                {/* {result.dateFounded > 0 && (
                          <div className="flex items-center">
                            <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                              <div className="grid h-9 w-9 place-content-center rounded-full bg-success-light text-success dark:bg-success dark:text-success-light">
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 8V12L14.5 14.5"
                                    stroke="#ffffff"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                                    stroke="#ffffff"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex font-semibold text-white-dark">
                                <h6>Business Founded</h6>
                                <p className="ltr:ml-auto rtl:mr-auto">
                                  {formatDistance(
                                    new Date(result.dateFounded),
                                    new Date(),
                                    { addSuffix: true }
                                  )}
                                </p>
                              </div>
                              <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                <div
                                  className="h-full w-full rounded-full bg-gradient-to-r from-[#3cba92] to-[#0ba360]"
                                  style={{
                                    width: `${calculateWidth(
                                      result.dateFounded
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )} */}

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
                        {result.location}
                      </p>
                    </div>
                    <div className="mb-5 h-2 w-full rounded-full">
                      {getISOAlpha2Code(result.location) !== undefined && (
                        <Flag
                          code={getISOAlpha2Code(result.location)}
                          height="48"
                          width="48"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {result.franchise && (
                  <div className="flex items-center">
                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                      <div className="grid h-9 w-9 place-content-center  rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
                        <FranchiseSVG />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex font-semibold text-white-dark">
                        <h6>Franchise?</h6>
                        <p className="ltr:ml-auto rtl:mr-auto">Yes</p>
                      </div>
                    </div>
                  </div>
                )}

                {result.askingPrice > 0 && (
                  <AskingPrice askingPrice={result.askingPrice} />
                )}

                {result.location2 && (
                  <div className="flex-1">
                    <div className="mb-2 flex font-semibold text-white-dark">
                      <h6>Location</h6>
                      <p className="w-9/12 text-blue-400 underline ltr:ml-auto rtl:mr-auto">
                        <a
                          href={`https://www.google.com/maps/place/${encodeURIComponent(
                            result.location2.replace(/Â/g, "")
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {result.location2.replace(/Â/g, "")}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <ApolloRecommends
            key={result.id}
            id={result.id}
            business={result.about}
            thesis={thesis}
            onRationaleUpdate={updateRationale}
          />
          <button
            type="button"
            className="btn btn-primary my-5 mx-3 mt-5 rounded-full"
          >
            <Link
              href={`/apps/newton?business=${createBusinessObject(result)}`}
              className="group"
              legacyBehavior
            >
              <a target="_blank">Evaluate this Business</a>
            </Link>
          </button>
          <button
            type="button"
            className="btn btn-primary my-5 mx-3 mt-5 rounded-full"
          >
            <Link
              href={`/apps/rockefeller-financing?business=${JSON.stringify({
                url: result.URL.replaceAll('"', "")
                  .replaceAll("&", "and")
                  .replaceAll("#", ""),
                about: result.about.replaceAll('"', "").replaceAll("&", "and"),
                name: result.listingHeadline
                  .replaceAll('"', "")
                  .replaceAll("&", "and"),
                price: result.askingPrice,
                rationale: rationales[result.id],
              })}`}
              className="group"
              legacyBehavior
            >
              <a target="_blank">Finance this Business</a>
            </Link>
          </button>
          <button
            type="button"
            className="btn btn-primary my-5 mx-3 mt-5 rounded-full"
          >
            {result.origin === "exclusive" ? (
              <a
                href={`/apps/sell-businesses/${
                  result.id
                }?business=${JSON.stringify({
                  rationale: rationales[result.id],
                })}`}
                target="_blank"
                rel="noreferrer"
                // onClick={(e) => {
                //   e.preventDefault();
                //   // Call a function instead of navigating to the URL
                //   handleShowDetail(result.id);
                // }}
              >
                View Business
              </a>
            ) : (
              <a href={result.URL} target="_blank" rel="noreferrer">
                View Business
              </a>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default MatcherData;
