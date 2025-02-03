import React from "react";

const releaseNotes = [
  {
    date: "V17 2023-04-22",
    items: [
      {
        title: "Newton",
        notes: [
          "Initial launch of Newton - tool for analyzing a business and producing a tailored checklist of due diligence items specific to that business.",
        ],
      },
      {
        title: "Backend",
        notes: [
          "Complete backend rewrite, to improve performance and reliability, and to support the next stages of our rapid platform scaling 🚀.",
        ],
      },
    ],
  },
  {
    date: "V16 2023-04-21",
    items: [
      {
        title: "Rockefeller",
        notes: [
          "Integration with Apollo is now live. Customers can now send their business from Apollo to Rockefeller for financing.",
        ],
      },
      {
        title: "Apollo",
        notes: [
          "Integration with Rockefeller is now live. Customers can now send their business from Apollo to Rockefeller for financing.",
        ],
      },
    ],
  },
  {
    date: "V15 2023-04-20",
    items: [
      {
        title: "Apollo",
        notes: [
          "Repaired Apollo's Insights, which were sometimes not loading for certain businesses.",
          "Updated Apollo's Insights to use the latest AI models. Inisghts are now more accurate and more useful.",
        ],
      },
    ],
  },
  {
    date: "V14 2023-04-19",
    items: [
      {
        title: "Rockefeller",
        notes: [
          "Application is stored to the browser, meaning customers don't have to reenter their information each time.",
        ],
      },
    ],
  },
  {
    date: "V13 2023-04-18",
    items: [
      {
        title: "Rockefeller",
        notes: [
          "Initial launch of Rockefeller Financing - tool for connecting business buyers with our network of finance providers.",
        ],
      },
      {
        title: "Frontend",
        notes: [
          "Split Rockefeller into two separate tools - Rockefeller Amortization Calculator and Rockefeller Financing.",
        ],
      },
    ],
  },
  {
    date: "V12 2023-04-14",
    items: [
      {
        title: "Apollo",
        notes: [
          "Refresh pipeline - constantly refresh data sources, removing businesses that have already sold, getting new businesses, and updating existing businesses.",
        ],
      },
    ],
  },
  {
    date: "V11 2023-04-13",
    items: [
      {
        title: "Frontend",
        notes: [
          "Simplified user interface. Removed unnecessary elements, and made the UI more intuitive.",
        ],
      },
    ],
  },
  {
    date: "V10 2023-04-07",
    items: [
      {
        title: "Rockefeller",
        notes: [
          "Initial launch of Rockefeller - tool for financing a business acquisition.",
          "Amortization calculator - enter the amount of the business loan, the interest rate and the terms to see a breakdown of payments over time, with a chart showing the split between interest and principal repayments.",
        ],
      },
      {
        title: "Socrates",
        notes: [
          "Added an estimated time remaining countdown, to make it easier to see how long the analysis will take.",
        ],
      },
    ],
  },
  {
    date: "V9 2023-04-06",
    items: [
      {
        title: "Apollo",
        notes: [
          "Allow users to filter business matches within a price range (e.g. show businesses between $50,000 - $1,000,000).",
        ],
      },
      {
        title: "General",
        notes: ["Rebrand platform to deal.ai."],
      },
    ],
  },
  {
    date: "V8 2023-04-04",
    items: [
      {
        title: "Backend",
        notes: [
          "Switch to a significantly improved AI model. Users should see a big leap in Socrates theses quality, relevance and improved analysis of macroeconomic trends.",
        ],
      },
    ],
  },
  {
    date: "V7 2023-03-24",
    items: [
      {
        title: "Socrates",
        notes: [
          "Allow the user to save their Socrates profile to their device, and then upload back into Socrates at a later date. Prevents having to recreate the profile each time.",
        ],
      },
    ],
  },
  {
    date: "V6 2023-03-23",
    items: [
      {
        title: "Apollo",
        notes: [
          "Add 'Apollo Recommends'. This feature uses the latest in AI models to give a short summary of each business recommended, and why it's a good match to the buyer.",
          "Show more - the user can now click to see more business matches in Apollo, up to a maximum of 100 (up from 10).",
        ],
      },
    ],
  },
  {
    date: "V5 2023-03-22",
    items: [
      {
        title: "General",
        notes: [
          "Increased robustness in the frontend to API errors - automatic retries.",
        ],
      },
    ],
  },
  {
    date: "V4 2023-03-20",
    items: [
      {
        title: "Apollo",
        notes: [
          "Add country flags to visually display the country each business is located in.",
        ],
      },
    ],
  },
  {
    date: "V3 2023-03-19",
    items: [
      {
        title: "Apollo",
        notes: [
          "Initial launch of Apollo - tool for finding businesses that match a buyer's thesis.",
        ],
      },
      {
        title: "Backend",
        notes: ["Improve AI model finetuning."],
      },
    ],
  },
  {
    date: "V2 2023-03-18",
    items: [
      {
        title: "Backend",
        notes: ["Significantly improve robustness to upstream API errors."],
      },
    ],
  },
  {
    date: "V1 2023-03-17",
    items: [
      {
        title: "Socrates",
        notes: [
          "Initial launch of Socrates - tool for helping a business buyer create and focus in on a set of theses that match their professional history, competencies, negative competencies, hobbies and interests, and currently operating businesses.",
        ],
      },
    ],
  },
];

const ReleaseNotes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <div className="space-y-6 p-6">
        {releaseNotes.map(release => (
          <div
            key={release.date}
            className="rounded-lg bg-gray-700 p-6 shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-semibold">{release.date}</h2>
            <div className="space-y-4">
              {release.items.map(item => (
                <div key={item.title}>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <ul className="list-inside list-disc pl-4">
                    {item.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReleaseNotes;
