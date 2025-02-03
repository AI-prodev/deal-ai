import React, {
  useImperativeHandle,
  useState,
  useEffect,
  ChangeEvent,
} from "react";
import "nouislider/distribute/nouislider.css";
import Nouislider from "@x1mrdonut1x/nouislider-react";

interface MultiRangeSliderProps {
  minAge: number;
  maxAge: number;
  name?: string;
  label?: string;
  setFieldValue: (field: string, value: string) => void;
}

const MultiRangeSlider = React.forwardRef<
  HTMLInputElement,
  MultiRangeSliderProps
>((props, ref) => {
  const [state, setState] = useState({
    lowFormatted: String(props?.minAge),
    highFormatted: String(props?.maxAge),
  });

  useEffect(() => {
    const low = Number(state.lowFormatted);
    const high = Number(state.highFormatted);

    setState(prev => ({ ...prev, low, high }));
  }, [state.lowFormatted, state.highFormatted]);

  const onSlide = (
    _render: any,
    _handle: any,
    value: any,
    _un: any,
    _percent: any
  ) => {
    props.setFieldValue("targetingMinAge", value[0].toFixed(0));
    props.setFieldValue("targetingMaxAge", value[1].toFixed(0));
    setState({
      lowFormatted: value[0].toFixed(0),
      highFormatted: value[1].toFixed(0),
    });
  };

  const { lowFormatted, highFormatted } = state;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    <div className="w-full">
      <label htmlFor={props?.name} className="block w-fit text-sm font-medium">
        {props?.label}
      </label>
      <div className="relative mt-4">
        <Nouislider
          connect
          start={[state.lowFormatted, state.highFormatted]}
          behaviour="tap"
          range={{ min: 18, max: 65 }}
          onSlide={onSlide}
        />
        <p className="mb-7 mt-7 flex items-center justify-between">
          Minimum Age
          <input
            type="text"
            value={lowFormatted}
            name="lowFormatted"
            onChange={handleInputChange}
            className="ml-1 mr-2 w-7 flex-grow border-none bg-transparent font-bold"
          />{" "}
          Maximum Age
          <input
            type="text"
            value={highFormatted}
            name="highFormatted"
            onChange={handleInputChange}
            className="ml-2 w-10 flex-grow border-none bg-transparent font-bold"
          />
        </p>
      </div>
    </div>
  );
});

export default MultiRangeSlider;
