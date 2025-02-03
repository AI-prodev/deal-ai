import React, { useState, useEffect } from "react";
import { ThesisData } from "@/interfaces/ThesisData";
import Link from "next/link";
import StarIcon from "./StarIcon";
import {
  useAddFavoriteMutation,
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
} from "@/store/features/favoritesApi";
import { showSuccessToast } from "@/utils/toast";
type FavoriteState = ThesisDataWithFavoriteId[];
interface ThesisProps {
  thesis: ThesisData;
  icon?: string;
  land?: boolean;
  favData?: string;
  onRemoveFavorite?: (type: string) => void;
}
type ThesisDataWithFavoriteId = ThesisData & { _id: string };

const Thesis: React.FC<ThesisProps> = ({
  thesis,
  icon,
  land,
  favData,
  onRemoveFavorite,
}) => {
  const [favorites, setFavorites] = useState<FavoriteState>([]);
  const [addFavorite, { data: addFavoriteData, isLoading: isAdding }] =
    useAddFavoriteMutation();
  const [removeFavorite, { isLoading: isRemoving }] =
    useRemoveFavoriteMutation();

  const getFavoriteIdFromState = (thesis: ThesisData): string | null => {
    const favorite = favorites.find(
      favorite => favorite.thesis === thesis.thesis
    );
    return favorite ? favorite._id : null;
  };

  const removeFromFavoritesInState = (thesis: ThesisData): void => {
    setFavorites(
      favorites.filter(favorite => favorite.thesis !== thesis.thesis)
    );
  };

  const addToFavoritesInState = (
    thesisWithFavoriteId: ThesisDataWithFavoriteId
  ): void => {
    setFavorites([...favorites, thesisWithFavoriteId]);
  };

  const replaceAmpersandInKeys = (thesisData: ThesisData): ThesisData => {
    const newThesisData: ThesisData = {
      ...thesisData,
      me: thesisData.me.replace(/&/g, "and"),
      trends: thesisData.trends.replace(/&/g, "and"),
      thesis: thesisData.thesis.replace(/&/g, "and"),
    };

    return newThesisData;
  };

  if (!thesis) return null;

  const parsedContent = `
<li class="mb-2.5"><span class="font-bold">Relevance to me:</span> ${thesis.me}</li>
<li><span class="font-bold">Relevance to current trends:</span> ${thesis.trends}</li>
`;
  const linkHref = land
    ? `/apps/apollo-land?thesis=${JSON.stringify(
        replaceAmpersandInKeys(thesis)
      )}`
    : `/apps/apollo?thesis=${JSON.stringify(replaceAmpersandInKeys(thesis))}`;

  const handleOnClickFav = async () => {
    if (favData) {
      await removeFavorite({ favoriteId: favData });

      removeFromFavoritesInState(thesis);
      onRemoveFavorite && onRemoveFavorite(land ? "socrates-land" : "socrates");
    }
    if (thesis.thesis && !favData) {
      const data = {
        type: land ? "socrates-land" : "socrates",
        data: thesis,
      };

      const favoriteId = getFavoriteIdFromState(thesis);

      if (favoriteId) {
        await removeFavorite({ favoriteId });

        removeFromFavoritesInState(thesis);
      } else {
        await addFavorite({ data });
      }
    }
  };

  useEffect(() => {
    if (addFavoriteData) {
      addToFavoritesInState({
        ...thesis,
        _id: addFavoriteData?._id,
      });
    }
  }, [addFavoriteData]);

  return (
    <div className="mb-5 flex w-full items-center justify-center">
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="py-7 px-6">
          <div className="flex justify-between">
            {icon ? (
              <div className="mb-5  inline-block rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
                <div dangerouslySetInnerHTML={{ __html: icon }} />
              </div>
            ) : (
              <div />
            )}

            <StarIcon
              className=" h-10 w-10"
              width={35}
              height={35}
              loading={isAdding || isRemoving}
              onClick={handleOnClickFav}
              isFav={favData ? true : false}
            />
          </div>

          <h5 className="mb-4 text-xl font-semibold text-[#ffffff] dark:text-white-light">
            {thesis.thesis}
          </h5>
          <p className="text-white-light">
            <ul dangerouslySetInnerHTML={{ __html: parsedContent }} />
          </p>
          <button type="button" className="btn btn-primary mt-5 rounded-full">
            <Link href={linkHref} legacyBehavior>
              <a target="_blank">Send to Explore</a>
            </Link>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L8.5 15.5M18 6H9M18 6V15M18 6L11.5 12.5"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Thesis;
