import Tippy from "@tippyjs/react";
import StarRating from "./StarRating";

export const HookItem = ({
  hook,
  type,
  onCopy,
  onRateChange,
  loadingState,
  hookRatings,
}: any) => {
  const need = type === "bonus" ? hook.b : hook.q;
  const satisfaction = type === "bonus" ? hook.r : hook.a;
  const ratingKey = `The need: ${need}, How my business satisfies the need: ${satisfaction}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg p-3 shadow-lg transition-all duration-300 hover:shadow-2xl md:flex-row">
      {hook.lang === "Arabic" ? (
        <>
          <p className="text-sm md:flex-1 md:pl-4" dir="rtl">
            {satisfaction}
          </p>
          <div className="text-sm text-white md:w-[250px]" dir="rtl">
            {need}
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-white md:w-[250px]">{need}</div>
          <p className="text-sm md:flex-1 md:pl-4">{satisfaction}</p>
        </>
      )}
      <div className="flex items-center gap-2">
        <StarRating
          rating={hookRatings[ratingKey] || 0}
          setRating={rating => onRateChange(ratingKey, rating, hook.id)}
          isLoading={loadingState[hook.id] || false}
        />
      </div>
      <Tippy content="Copy" placement="top">
        <button
          className="mb-5 rounded bg-blue-500 px-4 py-2 text-xs font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-md focus:outline-none active:bg-blue-600 md:ml-4 md:mb-0"
          onClick={() => onCopy(hook)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.9983 10C20.9862 7.82497 20.8897 6.64706 20.1213 5.87868C19.2426 5 17.8284 5 15 5H12C9.17157 5 7.75736 5 6.87868 5.87868C6 6.75736 6 8.17157 6 11V16C6 18.8284 6 20.2426 6.87868 21.1213C7.75736 22 9.17157 22 12 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
              stroke="#FFFFFF"
              stroke-width="1.5"
              stroke-linecap="round"
            />

            <path
              d="M3 10V16C3 17.6569 4.34315 19 6 19M18 5C18 3.34315 16.6569 2 15 2H11C7.22876 2 5.34315 2 4.17157 3.17157C3.51839 3.82475 3.22937 4.69989 3.10149 6"
              stroke="#FFFFFF"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </Tippy>
    </div>
  );
};
