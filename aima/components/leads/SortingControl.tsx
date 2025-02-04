import React from "react";
import { Menu, Transition } from "@headlessui/react";

interface SortingOption {
  name: string;
  value: string;
}

interface SortControlProps {
  sortStatus: { columnAccessor: string; direction: "asc" | "desc" };
  setSort: (value: string) => void;
}

const SortControl: React.FC<SortControlProps> = ({ sortStatus, setSort }) => {
  const sortingOptions: SortingOption[] = [
    {
      name: "Date Added",
      value: "createdAt",
    },
    {
      name: "Business Name",
      value: "businessName",
    },
    {
      name: "Marketing Budget",
      value: "monthlyMarketingBudget",
    },
    {
      name: "Location",
      value: "location",
    },
    {
      name: "Currently Working With Agency",
      value: "workingWithAgency",
    },
  ];

  const getSortIcon = (value: string) => {
    if (sortStatus.columnAccessor === value) {
      return sortStatus.direction === "asc" ? (
        // SVG for ascending
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 13L12 7L5 13"
            stroke="#1C274C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M19 17L12 11L5 17"
            stroke="#1C274C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ) : (
        // SVG for descending

        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 11L12 17L5 11"
            stroke="#1C274C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M19 7L12 13L5 7"
            stroke="#1C274C"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      );
    }
    return null; // Return null or a default SVG if needed
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
          Sort
          {/* <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" /> */}
        </Menu.Button>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {sortingOptions.map(option => (
            <Menu.Item key={option.value}>
              {({ active }) => (
                <button
                  onClick={() => setSort(option.value)}
                  className={`${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  {getSortIcon(option.value)}
                  <span className="ml-3">{option.name}</span>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SortControl;
