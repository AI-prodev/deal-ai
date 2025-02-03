import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useState } from "react";

const Reset = () => {
  const [hasReset, setHasReset] = useState(false);

  return (
    <div className="flex justify-center">
      <div className="p-3">
        <div>
          <h2 className="mt-2 text-2xl font-bold">Reset</h2>
        </div>

        <div className="my-3 w-full max-w-[780px] justify-center pt-2">
          <h3 className="text-md mt-2 text-white">
            If you're starting work on a different business or project, you can
            quickly reset everything you've entered.
          </h3>
          <h3 className="text-md mt-2 text-white">
            This will remove all saved data in Magic Hooks, Benefit Stacks,
            Bonus Items, FAQs, Hero Images, Scroll-Stopping Ads, and Ecommerce
            PDP, and reset the fine-tuning to the default settings.
          </h3>
          <button
            onClick={() => {
              const forms = [
                "hooks",
                "benefit",
                "bonus",
                "faq",
                "hero",
                "adSocial",
                "commerce",
                "amazon",
                "emailSequence",
              ];

              for (const form of forms) {
                localStorage.removeItem(`${form}FormValues`);
                localStorage.removeItem(`${form}RequestToken`);
                localStorage.removeItem(`${form}RequestTokenGenerations`);
              }
              localStorage.removeItem("imageIdeasRequestTokenHeroGenerations");
              localStorage.removeItem("imageIdeasRequestTokenAdGenerations");
              localStorage.removeItem("mostRecentGenerationData");
              localStorage.removeItem("sharedFormValues");
              localStorage.removeItem("activeState");
              localStorage.removeItem("imageBusinessDescription");
              localStorage.removeItem("commerceHooksData");
              localStorage.removeItem("amazonHooksData");
              localStorage.removeItem("savedCommerceImageUrl");
              localStorage.removeItem("imageUploadToken");
              localStorage.removeItem(
                "emailSequencehooksRequestTokenGenerations"
              );
              setHasReset(true);
            }}
            className="mt-5 mb-5 rounded bg-danger px-4 py-2 text-white"
          >
            Reset
          </button>
          {hasReset && (
            <div className="flex items-center rounded-md bg-green-500 p-4 text-white">
              <span className="mr-2 text-xl">✓</span>
              <span>Reset complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Reset, USER_ROLES, "ai-platform");
