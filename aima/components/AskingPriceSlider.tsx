import React, { useImperativeHandle, useState, useEffect } from "react";
import "nouislider/distribute/nouislider.css";
import Nouislider from "@x1mrdonut1x/nouislider-react";

const AskingPriceSlider = React.forwardRef((_props, ref) => {
  const [state, setState] = useState({
    low: 1,
    high: 10_000_000,
    lowFormatted: "$1",
    highFormatted: "$10,000,000",
  });

  useEffect(() => {
    const low = Number(state.lowFormatted.replace(/\D/g, ""));
    const high = Number(state.highFormatted.replace(/\D/g, ""));

    setState(prev => ({ ...prev, low, high }));
  }, [state.lowFormatted, state.highFormatted]);

  const onSlide = (
    _render: any,
    _handle: any,
    value: any,
    _un: any,
    _percent: any
  ) => {
    setState({
      low: value[0].toFixed(0),
      high: value[1].toFixed(0),
      lowFormatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value[0]),
      highFormatted: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value[1]),
    });
  };

  useImperativeHandle(ref, () => ({
    getSliderValues: () => {
      return { low: state.low, high: state.high };
    },
  }));

  const { lowFormatted, highFormatted } = state;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = Number(e.target.value.replace(/\D/g, ""));

    setState(prev => ({
      ...prev,
      [name]: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value),
      [name.replace("Formatted", "")]: value,
    }));
  };

  return (
    <div className="mx-7 my-7">
      <Nouislider
        connect
        start={[state.low, state.high]}
        behaviour="tap"
        range={{ min: 1, max: 10_000_000 }}
        onSlide={onSlide}
      />
      <p className="mb-7 mt-7 flex items-center justify-between">
        Show businesses between{" "}
        <input
          type="text"
          value={lowFormatted}
          name="lowFormatted"
          onChange={handleInputChange}
          className="ml-1 mr-2 w-7 flex-grow border-none bg-transparent font-bold"
        />{" "}
        and{" "}
        <input
          type="text"
          value={highFormatted}
          name="highFormatted"
          onChange={handleInputChange}
          className="ml-2 w-10 flex-grow border-none bg-transparent font-bold"
        />
        .
      </p>
    </div>
  );
});

export default AskingPriceSlider;
