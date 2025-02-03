import React from "react";
import { Dialog, Disclosure } from "@headlessui/react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

import {
  ComponentFieldWithLabel,
  FieldWithLabel,
} from "../marketingHooks/FieldWithLabel";
import FormikCapsuleDropDown from "../marketingHooks/CapsuleDropDown";
import ImageTypeSelector from "../marketingHooks/ImageTypeSelector";
import ImageStyleSelector from "../marketingHooks/ImageStyleSelector";
import AspectRatioSelectorAdSocial from "../marketingHooks/AspectRatioSelectorAdSocial";
import MaximumImpactToggles from "../marketingHooks/MaximumImpactToggles";
import { useSelectiveLocalStorageForm } from "@/hooks/useLocalStorageForm";

// Form validation schema
const ManualCampaignModalSchema = Yup.object().shape({
  businessDescription: Yup.string().required(
    "Business description is required"
  ),
});

interface FormValues {
  businessDescription: string;
}

const ManualCampaignModal = ({ isOpen, onRequestClose, onAddItem }: any) => {
  const createInitialSwitches = (count: number) => {
    return [
      { "Vivid Colors and Contrasts": true },
      { "Focus on Composition": true },
      { "Incorporate Movement or Action": true },
      { "Clarity and Simplicity": true },
      { "Use of Scale and Perspective": true },
      { "Emotional Appeal": true },
      { "Innovative or Unexpected Elements": true },
      { "Use Negative Space": true },
      { "Texture and Patterns": true },
      { "Psychological Triggers": true },
      { "Sensory Appeal": true },
    ];
  };
  const initialFormValues: FormValues = {
    businessDescription: "",
  };

  const localStorageKeyShared = "sharedFormValues";
  const sharedFieldsToPersist: (keyof FormValues)[] = ["businessDescription"];
  const localStorageKeyForm = "queueFormValues";
  const formFieldsToPersist: (keyof FormValues)[] = [];

  const [formValues, setFormValues] = useSelectiveLocalStorageForm<FormValues>(
    initialFormValues,
    localStorageKeyShared,
    sharedFieldsToPersist,
    localStorageKeyForm,
    formFieldsToPersist
  );

  const initialValues = {
    businessDescription: formValues.businessDescription || "",
    targetAudience: "everyone",
    colours: "",
    imageType: "",
    imageStyle: "",
    aspectRatio: "Portrait (Stories / Reel)",
    impacts: createInitialSwitches(11),
    instructions: "",
    aggressiveness: 8,
    hookCreative: 10,
    language: "English",
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onRequestClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Dialog.Panel className="mx-auto h-4/5 w-full max-w-2xl overflow-auto rounded-lg bg-black p-8 shadow-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={ManualCampaignModalSchema}
            onSubmit={values => {
              setFormValues({
                ...values,
                businessDescription: values.businessDescription,
              });

              onAddItem(values);
              onRequestClose();
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="text-white">
                <FieldWithLabel
                  name="businessDescription"
                  label="Business Description"
                  component="textarea"
                  className="mb-4 block w-full rounded border border-gray-600 bg-gray-800 p-2"
                  rows={4}
                />

                <Disclosure as="div" className="my-4">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-600 px-4 py-2 text-left text-sm font-medium text-blue-200 hover:bg-blue-700 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                        <span>
                          {open
                            ? "Hide Advanced Settings"
                            : "Show Advanced Settings"}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 transform ${
                            open ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm">
                        <div className="mt-4">
                          <MaximumImpactToggles name="impacts" />
                        </div>

                        <div className="mt-4">
                          <ImageTypeSelector
                            setFieldValue={setFieldValue}
                            values={values}
                          />
                        </div>

                        <ImageStyleSelector
                          setFieldValue={setFieldValue}
                          values={values}
                        />
                        <AspectRatioSelectorAdSocial
                          setFieldValue={setFieldValue}
                          values={values}
                        />
                        <ComponentFieldWithLabel
                          name="colours"
                          label="Preferred Colors"
                          component={FormikCapsuleDropDown}
                          suggestions={[
                            "Red",
                            "Orange",
                            "Yellow",
                            "Green",
                            "Blue",
                            "Indigo",
                            "Violet",
                            "Black and White (Monochrome)",
                            "Greyscale",
                            "Sepia",
                            "Pastel",
                          ]}
                        />
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

                <button
                  type="submit"
                  className="mt-4 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 focus:outline-none"
                >
                  Add to Campaign
                </button>
                <button
                  onClick={onRequestClose}
                  className="mt-2 w-full text-center text-red-500 hover:text-red-700 focus:outline-none"
                >
                  Close
                </button>
              </Form>
            )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ManualCampaignModal;
