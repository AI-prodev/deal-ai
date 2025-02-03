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
import ApolloLandRecommends from "./ApolloLandRecommends";
import RelevanceScore from "../apollo/RelevanceScore";
import AskingPrice from "../apollo/AskingPrice";
import { CountrySVG } from "@/components/icons/SVGData";

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

function getISOAlpha2Code(country: string): string | undefined {
  const formattedCountry = country.trim().toLowerCase();
  const countryCode = countryCodes.find(
    c => c.name.toLowerCase() === formattedCountry
  );

  return countryCode?.code;
}

type DataWithFavoriteId = LandData & { _id: string };
type FavoriteState = DataWithFavoriteId[];
interface MatcherDataProps {
  result: LandData;
  handleShowDetail: (id: string) => void;
  thesis: ThesisData | null;
  favData?: string;
  onRemoveFavorite?: (type: string) => void;
}

const buildURL = (path: string, propertyObject: Record<string, any>) => {
  const propertyJSON = JSON.stringify(propertyObject);
  return `${path}?property=${propertyJSON}`;
};
const useFavorites = (
  result: LandData,
  thesis: ThesisData | null,
  favData?: string,
  onRemoveFavorite?: (type: string) => void
) => {
  const [favorites, setFavorites] = useState<DataWithFavoriteId[]>([]);
  const [addFavorite, { data: addFavoriteData, isLoading: isAdding }] =
    useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] =
    useRemoveFavoriteMutation();
  const getFavoriteIdFromState = (result: LandData): string | null => {
    const favorite = favorites.find(favorite => favorite.id === result.id);
    return favorite ? favorite._id : null;
  };

  const removeFromFavoritesInState = (result: LandData): void => {
    setFavorites(favorites.filter(favorite => favorite !== result));
  };

  const addToFavoritesInState = (
    dataWithFavoriteId: DataWithFavoriteId
  ): void => {
    setFavorites([...favorites, dataWithFavoriteId]);
  };
  const handleOnClickFav = async () => {
    if (favData) {
      await removeFavorite({ favoriteId: favData });

      removeFromFavoritesInState(result);
      onRemoveFavorite && onRemoveFavorite("apollo-land");
    }
    if (result && !favData) {
      const data = {
        type: "apollo-land",
        data: { result, thesis },
      };

      const favoriteId = getFavoriteIdFromState(result);

      if (favoriteId) {
        await removeFavorite({ favoriteId });

        removeFromFavoritesInState(result);
      } else {
        await addFavorite({ data });
      }
    }
  };

  useEffect(() => {
    if (addFavoriteData) {
      addToFavoritesInState({
        ...result,
        ...thesis,
        _id: addFavoriteData?._id,
      });
    }
  }, [addFavoriteData]);

  return { handleOnClickFav, isAdding, isRemoving };
};

const LandMatcherData: React.FC<MatcherDataProps> = ({
  result,
  handleShowDetail,
  thesis,
  favData,
  onRemoveFavorite,
}) => {
  const [rationales, setRationales] = useState<Record<string, string>>({});

  // const [favorites, setFavorites] = useState<FavoriteState>([]);
  // const [addFavorite, { data: addFavoriteData, isLoading: isAdding }] =
  //   useAddFavoriteMutation();
  // const [removeFavorite, { isLoading: isRemoving }] =
  //   useRemoveFavoriteMutation();

  const { handleOnClickFav, isAdding, isRemoving } = useFavorites(
    result,
    thesis,
    favData,
    onRemoveFavorite
  );

  const evaluatePropertyUrl = buildURL("/apps/newton-property", {
    about: result.about.replaceAll(/&nbsp;/g, " "),
    name: result.listingHeadline,
    acres: result.acres.toString(),
    type: result.type || "",
    email: result.sellerEmail || "",
    firstName: result.sellerFirstName || "",
    lastName: result.sellerLastName || "",
  });

  const financePropertyUrl = buildURL("/apps/rockefeller-property-financing", {
    url: result.URL,
    about: result.about,
    name: result.listingHeadline,
    price: result.askingPrice.toString(),
    acres: result.acres.toString(),
    location: result.location,
    rationale: rationales[result.id],
  });

  const updateRationale = (id: string, rationale: string) => {
    setRationales(prevRationales => ({
      ...prevRationales,
      [id]: rationale,
    }));
  };

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

        <div className="py-7 px-6">
          <h5 className="mb-4 text-xl font-semibold text-[#ffffff] dark:text-white-light">
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
                        {result.country}
                      </p>
                    </div>
                    <div className="mb-5 h-2 w-full rounded-full">
                      {getISOAlpha2Code(result.country) !== undefined && (
                        <Flag
                          code={getISOAlpha2Code(result.country)}
                          height="48"
                          width="48"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {result.askingPrice > 0 && (
                  <AskingPrice askingPrice={result.askingPrice} />
                )}
                {result.acres > 0 && (
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="mb-2 flex font-semibold text-white-dark">
                        <h6>Acres</h6>
                        <p className="ltr:ml-auto rtl:mr-auto">
                          {result.acres}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {result.location && (
                  <div className="flex-1">
                    <div className="mb-2 flex font-semibold text-white-dark">
                      <h6>Location</h6>
                      <p className="w-9/12 text-blue-400 underline ltr:ml-auto rtl:mr-auto">
                        <a
                          href={`https://www.google.com/maps/place/${encodeURIComponent(
                            result.location.replace(/Â/g, "")
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {result.location.replace(/Â/g, "")}
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
          <ApolloLandRecommends
            key={result.id}
            id={result.id}
            results={result}
            thesis={thesis}
            onRationaleUpdate={updateRationale}
          />
          <button
            type="button"
            className="btn btn-primary my-5 mx-3 mt-5 rounded-full"
          >
            <Link href={evaluatePropertyUrl} className="group" legacyBehavior>
              <a target="_blank">Evaluate this Property</a>
            </Link>
          </button>
          <button
            type="button"
            className="btn btn-primary my-5 mx-3 mt-5 rounded-full"
          >
            <Link href={financePropertyUrl} className="group" legacyBehavior>
              <a target="_blank">Finance this Property</a>
            </Link>
          </button>
          <button
            type="button"
            className="btn btn-primary my-5 mx-3 mt-5 rounded-full"
          >
            {result.URL.includes("/broker-property?detail=") ? (
              <button
                onClick={e => {
                  e.preventDefault();
                  // Call a function instead of navigating to the URL
                  handleShowDetail(result.id);
                }}
              >
                View Property
              </button>
            ) : (
              <a href={result.URL} target="_blank" rel="noreferrer">
                View Property
              </a>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default LandMatcherData;
