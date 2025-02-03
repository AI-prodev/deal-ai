import React from "react";
import { Tab } from "@headlessui/react";
import { useGetFavoritesQuery } from "@/store/features/favoritesApi";
import Thesis from "../Thesis";
import { svgLibrary } from "@/utils/data/others";

interface FavoriteThesisProps {}

const FavoriteThesis: React.FC<FavoriteThesisProps> = () => {
  const {
    data: businessFavorites,
    isLoading: isBusinessLoading,
    isError: isBusinessError,
    refetch: businessRefetch,
  } = useGetFavoritesQuery("socrates");

  const {
    data: commercialFavorites,
    isLoading: isCommercialLoading,
    isError: isCommercialError,
    refetch: landRefetch,
  } = useGetFavoritesQuery("socrates-land");

  if (isBusinessLoading || isCommercialLoading) {
    return (
      <div className="flex h-full items-center justify-center text-lg text-blue-600">
        Loading...
      </div>
    );
  }

  if (isBusinessError || isCommercialError) {
    return (
      <div className="flex h-full items-center justify-center text-lg text-red-600">
        Error loading data
      </div>
    );
  }

  const handleOnRemoveFavorite = (type: string) => {
    if (type === "socrates") {
      businessRefetch();
    } else if (type === "socrates-land") {
      landRefetch();
    }
  };

  return (
    <div className="mt-10">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-[#121c2c] p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-center ${
                selected ? "bg-blue-200 text-blue-700" : "text-blue-200"
              }`
            }
          >
            Business
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-center ${
                selected ? "bg-blue-200 text-blue-700" : "text-blue-200"
              }`
            }
          >
            Commercial Property
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-2">
          <Tab.Panel className="rounded-lg bg-transparent p-4 shadow-md">
            {businessFavorites && businessFavorites.length > 0 ? (
              businessFavorites.map((favorite: any, index: number) => (
                <div
                  key={favorite._id}
                  className="my-2 rounded-lg bg-transparent p-4 shadow"
                >
                  <Thesis
                    thesis={favorite.data}
                    favData={favorite._id}
                    onRemoveFavorite={handleOnRemoveFavorite}
                  />
                </div>
              ))
            ) : (
              <p className="mt-3 text-center font-mono text-lg text-white">
                No business favorites yet.
              </p>
            )}
          </Tab.Panel>

          <Tab.Panel className="rounded-lg  bg-transparent p-4 shadow-md">
            {commercialFavorites && commercialFavorites.length > 0 ? (
              commercialFavorites.map((favorite: any, index: number) => (
                <div
                  key={favorite._id}
                  className="my-2 rounded-lg bg-transparent p-4 shadow"
                >
                  <Thesis
                    thesis={favorite.data}
                    favData={favorite._id}
                    land
                    onRemoveFavorite={handleOnRemoveFavorite}
                  />
                </div>
              ))
            ) : (
              <p className="mt-3 text-center font-mono text-lg text-white">
                No commercial property favorites yet.
              </p>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default FavoriteThesis;
