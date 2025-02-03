import React from "react";

interface TabContentOneProps {
  setActiveTab: (tab: number) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TabContentOne: React.FC<TabContentOneProps> = ({
  setActiveTab,
  handleFileUpload,
}) => {
  return (
    <div>
      <h2>Welcome to the Thesis Builder!</h2>
      <br />
      <p>
        In the next page, you'll enter information about the buyer, including
        previous business acquisitions (if any), core competencies, target
        verticals, negative areas, and hobbies.
      </p>
      <br />
      <p>
        The tool will then generate a buying thesis that can be used to narrow
        in on the most suitable businesses for the buyer.
      </p>
      <br />
      <p>Let's go!</p>
      <div className="my-5 mb-5 flex items-center justify-center">
        <div className="w-full max-w-[32rem] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
          <div className="py-7 px-6">
            <div className="mb-5 inline-block rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="8"
                  cy="10"
                  r="2"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <circle
                  cx="2"
                  cy="2"
                  r="2"
                  transform="matrix(1 0 0 -1 14 16)"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 14V19"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 10V5"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M8 5V6"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 19V18"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
              New!
            </h5>
            <p className="text-white-dark">
              Have a prebuilt model? Upload it here!
            </p>
            <input
              className="btn btn-primary my-5 w-full md:w-auto"
              type="file"
              accept=".socrates"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContentOne;
