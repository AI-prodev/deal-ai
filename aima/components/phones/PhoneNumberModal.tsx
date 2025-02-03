import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Modal from "@/components/Modal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ModalLight from "@/components/ModalLight";
import { createPhoneAPI } from "@/store/features/phoneApi";
import {
  CheckmarkSVG,
  MagnifyingGlassSVG,
  PhoneSVG,
  PlayCircleMiniSVG,
} from "../icons/SVGData";
import LoadingSkeleton from "./LoadingSkeleton";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { IPhoneExtension, IPhoneNumber } from "@/interfaces/IPhoneNumber";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { createStripeApi } from "@/store/features/stripeApi";
import { formatPriceWithCents } from "../UnlockAccessModal";
import { Switch } from "@headlessui/react";
import AudioRecorder from "./AudioRecorder";

const convertToBoolean = (value: boolean | "yes" | "no"): boolean => {
  if (value === "yes") return true;
  if (value === "no") return false;
  return value;
};

interface Props {
  existingPhoneNumber?: IPhoneNumber;
  isOpen: boolean;
  onRequestClose: () => void;
  onPhoneNumberCreated: () => void;
  onPhoneNumberUpdated: () => void;
  onPhoneNumberReleased: () => void;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("A business name is required"),
  extensions: Yup.array()
    .of(
      Yup.object().shape({
        title: Yup.string().required("An extension name is required"),
        number: Yup.string().required("An extension phone number is required"),
      })
    )
    .min(1, "At least one extension is required"),
  number: Yup.string().required("A phone number is required"),
  numberFormatted: Yup.string(),
  record: Yup.boolean(),
  isGreetingEdited: Yup.boolean(),
  isGreetingAudio: Yup.boolean(),
  greetingText: Yup.string(),
  greetingAudio: Yup.string(),
  areaCode: Yup.number().typeError("Must be a 3-digit number"),
});

const PhoneNumberModal: React.FC<Props> = ({
  existingPhoneNumber,
  isOpen,
  onRequestClose,
  onPhoneNumberCreated,
  onPhoneNumberUpdated,
  onPhoneNumberReleased,
}) => {
  const [createPhoneNumber] = createPhoneAPI.useCreatePhoneNumberMutation();
  const [updatePhoneNumber] = createPhoneAPI.useUpdatePhoneNumberMutation();
  const [releasePhoneNumber] = createPhoneAPI.useReleasePhoneNumberMutation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGreeting, setEditingGreeting] = useState(false);
  const [greetingTab, setGreetingTab] = useState<"text" | "audio">("text");
  const [newGreeting, setNewGreeting] = useState("");
  const [newGreetingRecording, setNewGreetingRecording] = useState("");
  const [areaCode, setAreaCode] = useState<number | undefined>(undefined);
  const {
    data: availableNumbers,
    refetch: refetchNumbers,
    isFetching: isFetchingNumbers,
    isLoading: isLoadingNumbers,
  } = createPhoneAPI.useGetAvailablePhoneNumbersQuery(
    { areaCode },
    { skip: !isOpen || step !== 2 }
  );
  const [uploadGreeting] = createPhoneAPI.useUploadGreetingMutation();
  const [uploadingGreeting, setUploadingGreeting] = useState(false);
  const { data: quotas, refetch: refechQuotas } =
    createPhoneAPI.useGetQuotasQuery({});
  const [error, setError] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const { data: price } = createStripeApi.useGetPriceQuery({
    priceId: process.env.NEXT_PUBLIC_STRIPE_PHONE_PRICE_ID!,
  });
  const { data: product } = createStripeApi.useGetProductQuery({
    productId: process.env.NEXT_PUBLIC_STRIPE_PHONE_PRODUCT_ID!,
  });

  const paymentRequired = useMemo(() => {
    if (
      quotas &&
      quotas.existingPhoneNumbers >=
        quotas.phoneFreeQuota + quotas.phonePaidQuota
    ) {
      return true;
    }
    return false;
  }, [quotas]);

  const handleReleasePhoneNumber = async () => {
    if (!existingPhoneNumber || isSubmitting) {
      return;
    }
    const confirmation = prompt(
      `Are you sure you want to delete ${existingPhoneNumber.numberFormatted}? This action cannot be undone. Type DELETE to confirm.`
    );
    if (!confirmation) {
      return;
    }
    if (confirmation !== "DELETE") {
      alert("You must type DELETE to confirm.");
      return;
    }

    try {
      setIsSubmitting(true);

      await releasePhoneNumber({
        phoneNumberId: existingPhoneNumber._id,
      });

      refechQuotas();

      onPhoneNumberReleased();

      showSuccessToast({
        title: "Phone number deleted",
      });

      onRequestClose();
    } catch (error) {
      console.error(error);
      //@ts-ignore
      showErrorToast(
        //@ts-ignore
        error && error.data?.error ? (error as any).data.error : error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLight isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className={`mb-4 text-lg font-bold`}>
          {existingPhoneNumber ? "Edit Phone Number" : "New Phone Number"}
        </h2>
        <Formik
          initialValues={{
            title: existingPhoneNumber?.title || "",
            extensions: existingPhoneNumber?.extensions || [
              { title: "Support", number: "" },
            ],
            number: existingPhoneNumber?.number || "",
            numberFormatted: existingPhoneNumber?.numberFormatted || "",
            areaCode: undefined,
            isGreetingEdited: existingPhoneNumber
              ? existingPhoneNumber.isGreetingAudio ||
                !!existingPhoneNumber.greetingText
              : false,
            isGreetingAudio: existingPhoneNumber
              ? existingPhoneNumber.isGreetingAudio
              : false,
            greetingAudio: existingPhoneNumber
              ? existingPhoneNumber.greetingAudio || ""
              : "",
            greetingText: existingPhoneNumber
              ? existingPhoneNumber.greetingText || ""
              : "",
            extraGreetingText: "",
            record: existingPhoneNumber ? existingPhoneNumber.record : true,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              setSubmitting(true);

              const title = values.title;
              const extensions = values.extensions;
              const number = values.number;
              const numberFormatted = values.numberFormatted;
              const record = values.record;
              let isGreetingAudio = values.isGreetingAudio;
              let greetingText = values.greetingText + values.extraGreetingText;
              let greetingAudio = values.greetingAudio;
              if (editingGreeting) {
                isGreetingAudio = greetingTab === "audio";
                if (isGreetingAudio && newGreetingRecording) {
                  greetingAudio = newGreetingRecording;
                } else if (!isGreetingAudio && newGreeting) {
                  greetingText = newGreeting;
                }
              }

              if (existingPhoneNumber) {
                const data = await updatePhoneNumber({
                  phoneNumberId: existingPhoneNumber._id,
                  title,
                  extensions,
                  record,
                  isGreetingAudio,
                  greetingText,
                  greetingAudio,
                }).unwrap();

                onPhoneNumberUpdated();
                if (data) {
                  showSuccessToast({
                    title: "Saved changes",
                  });
                }
              } else {
                let paymentMethodId = "";

                if (error) {
                  const cardElement = elements?.getElement(CardElement);
                  if (!cardElement || !stripe) {
                    return;
                  }
                  const { paymentMethod, error } =
                    await stripe?.createPaymentMethod({
                      type: "card",
                      card: cardElement,
                    });
                  if (error) {
                    setError(error.message || "Something went wrong");
                    return;
                  }
                  paymentMethodId = paymentMethod.id;
                  setError("");
                }

                const res = await createPhoneNumber({
                  title,
                  extensions,
                  number,
                  numberFormatted,
                  record,
                  isGreetingAudio,
                  greetingText,
                  greetingAudio,
                  priceId: paymentRequired
                    ? process.env.NEXT_PUBLIC_STRIPE_PHONE_PRICE_ID!
                    : undefined,
                  paymentMethodId: paymentRequired
                    ? paymentMethodId
                    : undefined,
                });

                // eslint-disable-next-line no-console
                console.log("res=", JSON.stringify(res));

                if ((res as any)?.error?.status == 400) {
                  if ((res as any)?.error) {
                    throw new Error(
                      (res as any).error?.data?.error || "Something went wrong"
                    );
                  } else if ((res as any)?.data?.error) {
                    throw new Error(
                      (res as any).data?.error || "Something went wrong"
                    );
                  }
                } else if ((res as any)?.data?.error) {
                  // Set the error this way so that the card form shows
                  setError((res as any).data?.error || "Something went wrong");
                  return;
                }

                refechQuotas();

                onPhoneNumberCreated();

                showSuccessToast({
                  title: "Phone number created",
                });
              }

              onRequestClose();
            } catch (error) {
              console.error(error);
              //@ts-ignore
              showErrorToast(
                //@ts-ignore
                error && error.data?.error ? (error as any).data.error : error
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            isSubmitting,
            touched,
            errors,
            values,
            setFieldTouched,
            resetForm,
            setFieldValue,
          }) => {
            const [newExtensionsIndex, setNewExtensionsIndex] = useState(
              values.extensions.length
            );
            const [audio, setAudio] = useState<HTMLAudioElement | undefined>();

            useEffect(() => {
              setStep(1);
              setAreaCode(undefined);

              return () => {
                if (audio) {
                  audio.pause();
                }
                setEditingGreeting(false);
                setGreetingTab("text");
                setStep(1);
                resetForm();
                setAreaCode(undefined);
                setNewExtensionsIndex(values.extensions.length);
              };
            }, [isOpen]);

            const defaultGreeting = useMemo(() => {
              let result = "Hello and welcome.";
              if (values.title) {
                result = `Hello and welcome to ${values.title}.`;
              }
              for (let i = 0; i < values.extensions.length; i++) {
                if (values.extensions[i].title) {
                  result += ` Press ${i + 1} to be connected to ${values.extensions[i].title}.`;
                }
              }
              return result;
            }, [values]);

            // update edited text greeting if new extensions are added
            useEffect(() => {
              let extraGreetingText = "";
              for (
                let i = newExtensionsIndex;
                i < values.extensions.length;
                i++
              ) {
                if (values.extensions[i].title) {
                  extraGreetingText += ` Press ${i + 1} to be connected to ${values.extensions[i].title}.`;
                }
              }
              setFieldValue("extraGreetingText", extraGreetingText);
            }, [newExtensionsIndex, values.extensions]);

            const handleResetGreeting = useCallback(() => {
              if (!confirm("Are you sure you want to reset the greeting?")) {
                return;
              }
              setFieldValue("isGreetingEdited", false);
              setFieldValue("isGreetingAudio", false);
              setFieldValue("greetingText", "");
              setFieldValue("greetingAudio", "");
              setNewGreetingRecording("");
              setEditingGreeting(false);
              setNewExtensionsIndex(values.extensions.length);
              setGreetingTab("text");
            }, [
              defaultGreeting,
              setFieldValue,
              setGreetingTab,
              setEditingGreeting,
              newGreetingRecording,
            ]);

            const handleEditGreeting = useCallback(() => {
              setNewGreeting(
                values.isGreetingEdited
                  ? values.greetingText || defaultGreeting
                  : defaultGreeting
              );
              setEditingGreeting(true);
              setGreetingTab(values.isGreetingAudio ? "audio" : "text");
            }, [values.greetingText, defaultGreeting]);

            const handleSaveGreeting = useCallback(() => {
              if (greetingTab === "audio" && newGreetingRecording) {
                setFieldValue("isGreetingAudio", true);
                setFieldValue("greetingAudio", newGreetingRecording);
                setFieldValue("isGreetingEdited", true);
              } else if (greetingTab === "text" && newGreeting) {
                setFieldValue("isGreetingAudio", false);
                if (defaultGreeting !== newGreeting) {
                  setFieldValue("greetingText", newGreeting);
                  setFieldValue("isGreetingEdited", true);
                }
              }
              setEditingGreeting(false);
              setNewExtensionsIndex(values.extensions.length);
            }, [
              newGreeting,
              newGreetingRecording,
              greetingTab,
              defaultGreeting,
              setFieldValue,
              setEditingGreeting,
            ]);

            const handleRecording = useCallback(async (recording: Blob) => {
              try {
                setUploadingGreeting(true);
                const formData = new FormData();
                formData.append("audio", recording, "recording.mp3");
                const res = await uploadGreeting({
                  formData,
                });
                // eslint-disable-next-line no-console
                console.log("res=", res);
                if ((res as any)?.data?.greetingUrl) {
                  setNewGreetingRecording((res as any).data.greetingUrl);
                }
              } catch (err) {
                console.error(err);
              } finally {
                setUploadingGreeting(false);
              }
            }, []);

            const handlePlayRecording = useCallback(() => {
              if (audio) {
                audio.pause();
              }
              if (values.greetingAudio) {
                const audio = new Audio(values.greetingAudio);
                audio.play();
                setAudio(audio);
              }
            }, [values.greetingAudio, audio]);

            return (
              <Form>
                {step === 1 ? (
                  <>
                    <div>
                      <div
                        className={
                          touched.title && errors.title ? "has-error" : ""
                        }
                      >
                        <label htmlFor="title">Business Name</label>
                        <Field
                          name="title"
                          type="text"
                          id="title"
                          className="form-input"
                          placeholder="Acme Co"
                          style={{
                            backgroundColor: "white",
                            color: "#333333",
                          }}
                        />
                        {touched.title && (
                          <div className="mt-1 text-danger text-sm">
                            {errors.title}
                          </div>
                        )}
                      </div>
                      <label className="mt-4" htmlFor="extensions">
                        Extensions
                      </label>
                      <FieldArray name="extensions">
                        {({ push, remove }) => (
                          <div>
                            {values.extensions.map((extension, index) => (
                              <div
                                key={index}
                                className="flex flex-col md:flex-row items-center mt-1"
                              >
                                <div className="w-8 h-10 flex justify-center items-center bg-gray-200 rounded-lg text-black cursor-default">
                                  {index + 1}
                                </div>
                                <div className="mt-2 md:mt-0 md:ml-2 w-full md:w-auto md:flex-grow">
                                  <Field
                                    name={`extensions.${index}.title`}
                                    type="text"
                                    className="form-input bg-white text-black"
                                    style={{
                                      backgroundColor: "white",
                                      color: "#333333",
                                    }}
                                  />
                                </div>
                                <div className="mt-2 md:mt-0 text-xs mx-2 text-center">
                                  FORWARDS
                                  <br />
                                  TO:
                                </div>
                                <div className="mt-2 md:mt-0">
                                  <PhoneInput
                                    country={"us"}
                                    containerClass="phone-input-container"
                                    inputClass="phone-input-text"
                                    value={values.extensions[index].number}
                                    onChange={phone =>
                                      setFieldValue(
                                        `extensions.${index}.number`,
                                        "+" + phone
                                      )
                                    }
                                  />
                                </div>
                                {index === 0 ? (
                                  <div className="ml-2 w-8 h-8"></div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-black hover:bg-gray-100"
                                    aria-label="Remove field"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex justify-between items-center mt-2">
                              {values.extensions.length < 9 && (
                                <button
                                  className="rounded bg-white px-3 py-1 text-primary border border-primary text-sm"
                                  type="button"
                                  onClick={() => {
                                    push({
                                      title: "",
                                      number: "",
                                    });
                                    setFieldTouched("extensions", false);
                                  }}
                                >
                                  + Add Extension
                                </button>
                              )}
                              <div className="flex justify-end">
                                <div className="inline-flex items-center">
                                  <span className="mr-2 text-sm">
                                    {values.record
                                      ? "Record calls"
                                      : "Do not record calls"}
                                  </span>
                                  <Switch
                                    name="record"
                                    checked={convertToBoolean(values.record)}
                                    onChange={() =>
                                      setFieldValue(
                                        "record",
                                        convertToBoolean(!values.record)
                                      )
                                    }
                                    className={`${
                                      convertToBoolean(values.record)
                                        ? "bg-primary"
                                        : "bg-gray-500"
                                    } relative my-2 inline-flex h-6 w-11 items-center rounded-full`}
                                  >
                                    <span className="sr-only">Record</span>
                                    <span
                                      className={`${
                                        convertToBoolean(values.record)
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                    />
                                  </Switch>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </FieldArray>
                      {touched.extensions &&
                        typeof errors.extensions === "string" && (
                          <div className="mt-1 text-danger text-sm">
                            {errors.extensions}
                          </div>
                        )}
                      {touched.extensions &&
                        Array.isArray(errors.extensions) &&
                        errors.extensions.map(
                          (extensionError, index) =>
                            extensionError &&
                            typeof extensionError === "object" &&
                            Object.values(extensionError).length > 0 && (
                              <div
                                key={index}
                                className="mt-1 text-danger text-sm"
                              >
                                {`Extension ${index + 1}: ` +
                                  Object.values(extensionError).join(", ")}
                              </div>
                            )
                        )}
                    </div>
                    {values.title && (
                      <div className="mt-3 grid grid-cols-12 rounded-lg bg-gray-200 pl-2 pr-5 pt-5 pb-5 relative">
                        {uploadingGreeting && (
                          <div className="absolute inset-0 rounded-lg bg-[#FFFFFF99] z-50"></div>
                        )}
                        <div
                          className={`flex items-start justify-center col-span-3 md:col-span-1 ${!values.isGreetingAudio && "pt-0.5"}`}
                        >
                          <PhoneSVG className={`h-5 w-5 text-black`} />
                        </div>
                        <div className="col-span-9 md:col-span-11">
                          {editingGreeting ? (
                            <div className="rounded-lg">
                              <div className="flex">
                                <div
                                  className={`${greetingTab === "text" ? "bg-gray-300" : "bg-gray-200"} text-sm px-2 py-1 cursor-pointer rounded-tr-md rounded-tl-md`}
                                  onClick={() => setGreetingTab("text")}
                                >
                                  AI Voice
                                </div>
                                <div
                                  className={`ml-1 ${greetingTab === "audio" ? "bg-gray-300" : "bg-gray-200"} text-sm px-2 py-1 cursor-pointer rounded-tr-md rounded-tl-md`}
                                  onClick={() => setGreetingTab("audio")}
                                >
                                  Your Voice
                                </div>
                              </div>
                              <div className="bg-gray-300 p-2 rounded-tr-md rounded-bl-md rounded-br-md">
                                {greetingTab === "text" && (
                                  <div className="m-0 p-0 leading-3 h-24">
                                    <textarea
                                      value={newGreeting}
                                      onChange={e =>
                                        setNewGreeting(e.target.value)
                                      }
                                      className="w-full h-full p-2 text-sm m-0"
                                    />
                                  </div>
                                )}
                                {greetingTab === "audio" && (
                                  <div className="h-24 flex items-center justify-center">
                                    <AudioRecorder
                                      onRecorded={handleRecording}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <>
                              {values.isGreetingAudio ? (
                                <div className="text-sm flex">
                                  Recorded Greeting:
                                  <button
                                    type="button"
                                    onClick={handlePlayRecording}
                                    className="flex ml-1 text-blue-500 hover:text-blue-800 cursor-pointer"
                                  >
                                    <PlayCircleMiniSVG className="h-5 w-5 mr-0.5" />
                                    Play
                                  </button>
                                </div>
                              ) : (
                                <span className="italic text-sm">
                                  {values.isGreetingEdited
                                    ? values.greetingText || defaultGreeting
                                    : defaultGreeting}
                                  {values.extraGreetingText}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {values.isGreetingEdited &&
                          !values.isGreetingAudio &&
                          !editingGreeting && (
                            <div className="absolute -top-2 -left-6 text-xs text-gray-600 bg-gray-100 py-1 px-2 rounded flex scale-90 shadow">
                              Greeting has been modified from original |&nbsp;
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={handleResetGreeting}
                              >
                                Reset
                              </div>
                            </div>
                          )}
                        <div className="absolute top-1 right-2 text-xs text-gray-500 flex scale-90">
                          {editingGreeting && (
                            <>
                              {(values.isGreetingEdited ||
                                values.isGreetingAudio) && (
                                <>
                                  <div
                                    className="cursor-pointer hover:underline"
                                    onClick={handleResetGreeting}
                                  >
                                    Reset
                                  </div>
                                  &nbsp;|&nbsp;
                                </>
                              )}
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => setEditingGreeting(false)}
                              >
                                Cancel
                              </div>
                              &nbsp;|&nbsp;
                            </>
                          )}

                          {editingGreeting ? (
                            <>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={handleSaveGreeting}
                              >
                                Save
                              </div>
                            </>
                          ) : (
                            <div
                              className="cursor-pointer hover:underline"
                              onClick={handleEditGreeting}
                            >
                              Edit
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex flex-col md:flex-row justify-between">
                      {existingPhoneNumber && (
                        <div>
                          <button
                            type="button"
                            onClick={handleReleasePhoneNumber}
                            className="mr-2 rounded border border-red-500 px-4 py-2 text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      <div className="flex justify-end flex-grow mt-2 md:mt-0">
                        <button
                          type="button"
                          onClick={onRequestClose}
                          className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                        >
                          Cancel
                        </button>
                        {existingPhoneNumber ? (
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`rounded bg-primary px-4 py-2 text-white`}
                          >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              !errors.title && !errors.extensions?.length
                                ? setStep(2)
                                : setFieldTouched("extensions")
                            }
                            className={`rounded bg-primary px-4 py-2 text-white`}
                          >
                            Next
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div
                        className={`${
                          touched.areaCode && errors.areaCode ? "has-error" : ""
                        } relative`}
                      >
                        <Field
                          name="areaCode"
                          type="number"
                          id="areaCode"
                          className="form-input"
                          placeholder="Search Area Code"
                          style={{
                            backgroundColor: "white",
                            color: "#333333",
                          }}
                        />
                        {touched.areaCode && (
                          <div className="mt-1 text-danger text-sm">
                            {errors.areaCode}
                          </div>
                        )}
                        <div className="absolute top-0 right-2 h-full flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              setAreaCode(values.areaCode);
                              refetchNumbers();
                            }}
                            className="rounded bg-primary px-4 py-1 text-sm text-white"
                          >
                            <MagnifyingGlassSVG
                              className="h-5 w-5"
                              strokeWidth={2}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-0 h-48 overflow-auto relative">
                      {(isLoadingNumbers || isFetchingNumbers) && (
                        <div className="mt-2">
                          <LoadingSkeleton
                            skeletonCount={10}
                            skeletonHeight={10}
                            skeletonWidth={"full"}
                          />
                        </div>
                      )}
                      {availableNumbers?.map(number => (
                        <div
                          key={number.phoneNumber}
                          className={`mt-2 py-2 px-4 border-2 rounded-lg ${values.number === number.phoneNumber ? "border-slate-600 bg-gray-100" : "border-slate-300"}  hover:bg-gray-100 grid grid-cols-1 md:grid-cols-6 cursor-pointer`}
                          onClick={() => {
                            setFieldValue("number", number.phoneNumber);
                            setFieldValue(
                              "numberFormatted",
                              number.friendlyName || number.phoneNumber
                            );
                          }}
                        >
                          <div className="flex items-center justify-center md:justify-start">
                            <div className="rounded h-6 w-6 border-2 border-slate-300 flex items-center justify-center">
                              {values.number === number.phoneNumber && (
                                <CheckmarkSVG
                                  strokeWidth={3}
                                  className="h-4 w-4 text-slate-800"
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-center md:col-span-3 truncate">
                            {number.locality ? number.locality + ", " : ""}
                            {number.region &&
                              number.region !== number.isoCountry &&
                              number.region + " "}
                            {number.isoCountry}
                          </div>
                          <div className="flex items-center justify-center md:justify-end md:col-span-2">
                            {number.friendlyName}
                          </div>
                        </div>
                      ))}
                    </div>
                    {error && (
                      <div className="mt-2 w-full">
                        <div className="bg-gray-500 rounded px-4 py-1.5">
                          <p className="text-white text-sm">
                            There was a problem with your purchase. Please try
                            again with a new card.
                          </p>
                        </div>
                        <div className="mt-1 border rounded px-2 py-4 border-gray-500">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#000",
                                  "::placeholder": {
                                    color: "#aab7c4",
                                  },
                                },
                                invalid: {
                                  color: "#9e2146",
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex flex-col md:flex-row justify-between">
                      <div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                        >
                          Back
                        </button>
                      </div>
                      <div className="flex justify-end mt-2 md:mt-0">
                        {quotas && price && product ? (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={onRequestClose}
                              className="mr-2 rounded border border-primary px-4 py-2 text-primary"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className={`rounded bg-primary px-4 py-2 text-white`}
                            >
                              {isSubmitting
                                ? "Please wait..."
                                : paymentRequired
                                  ? `Get Number for ${formatPriceWithCents(price.unit_amount, price.type, price.recurring)}`
                                  : "Get Phone Number"}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 flex justify-end">&nbsp;</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </Form>
            );
          }}
        </Formik>
      </div>
    </ModalLight>
  );
};

export default PhoneNumberModal;
