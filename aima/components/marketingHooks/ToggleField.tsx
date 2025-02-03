import Tippy from "@tippyjs/react";
import { Field } from "formik";
import { ChangeEvent } from "react";
import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";

export const ToggleField = ({
  fieldId,
  checkFieldId,
  label,
  isChecked,
  onChange,
  submitCount,
  errors,
  tooltipContent,
  isField = true,
}: {
  fieldId: string;
  checkFieldId: string;
  label: string;
  isChecked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  submitCount: number;
  errors: any;
  tooltipContent?: string;
  isField?: boolean;
}) => {
  const [ref, { height }] = useMeasure();
  const accordionAnimation = useSpring({
    height: isChecked ? `${height}px` : "0px",
    opacity: isChecked ? 1 : 0,
    config: { tension: 500, friction: 52 },
  });

  return (
    <div className="my-4">
      {tooltipContent ? (
        <Tippy content={tooltipContent} placement="top">
          <label htmlFor={checkFieldId} className="w-fit">
            {label}
          </label>
        </Tippy>
      ) : (
        <label htmlFor={checkFieldId}>{label}</label>
      )}

      <div className="flex items-center">
        <span>No</span>
        <label className="relative ml-2 mr-2 h-6 w-12">
          <input
            type="checkbox"
            className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
            id={checkFieldId}
            checked={isChecked}
            onChange={onChange}
          />
          <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:left-1 before:bottom-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:!bg-gray-500 dark:before:bg-white dark:peer-checked:before:bg-white"></span>
        </label>
        <span>Yes</span>
      </div>
      {isField && (
        <animated.div style={{ ...accordionAnimation, overflow: "hidden" }}>
          <div ref={ref}>
            <div
              className={
                submitCount
                  ? errors[fieldId]
                    ? "has-error"
                    : "has-success"
                  : ""
              }
            >
              <div className="flex">
                <Field
                  name={fieldId}
                  type="textarea"
                  id={fieldId}
                  className="form-input"
                  as="textarea"
                />
              </div>
              {submitCount
                ? errors[fieldId] && (
                    <div className="mt-1 text-danger">{errors[fieldId]}</div>
                  )
                : ""}
            </div>
          </div>
        </animated.div>
      )}
    </div>
  );
};
