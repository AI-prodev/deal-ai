import React from "react";

import { AskingPriceSVG } from "./Svg/SvgData";

interface AskingPriceProps {
  askingPrice: number;
}

const AskingPrice: React.FC<AskingPriceProps> = ({ askingPrice }) => {
  return (
    <>
      {askingPrice > 0 && (
        <div className="flex items-center">
          <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
            <div className="grid h-9 w-9 place-content-center  rounded-full bg-success text-secondary dark:bg-success dark:text-secondary-light">
              <AskingPriceSVG />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex font-semibold text-white-dark">
              <h6>Asking Price</h6>
              <p className="ltr:ml-auto rtl:mr-auto">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                }).format(askingPrice)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AskingPrice;
