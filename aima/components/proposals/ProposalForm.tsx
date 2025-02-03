import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/utils/toast";
import {
  createProposalAPI,
  updateRegeneration,
} from "@/store/features/proposalApi";
import LoadingAnimation from "../LoadingAnimation";
import useServerTokenTracking from "@/hooks/useServerTokenTracking";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import {
  MinimalBuildingProgress,
  ThesisBuildingProgress,
} from "../ThesisBuildingProgress";

interface Props {
  onProposalCreated: () => void;
}

const validationSchema = Yup.object().shape({
  businessName: Yup.string().required("Business name is required"),
  businessWebsite: Yup.string().required("Business website is required"),
});

const ProposalForm: React.FC<Props> = ({ onProposalCreated }) => {
  const regeneration = useSelector(
    (state: IRootState) => state.proposal.regenerate
  );
  const dispatch = useDispatch();
  const [startProposal] = createProposalAPI.useStartProposalRequestMutation();
  const [queryProposal] = createProposalAPI.useQueryProposalRequestMutation();
  const [endProposal] = createProposalAPI.useEndProposalRequestMutation();
  const [shouldReset, setShouldReset] = useState(false);

  const handleEndResponse = (res: any) => {
    setShouldReset(true);
    onProposalCreated();
    showSuccessToast({ title: "Proposal created" });
  };

  const { startAndTrack, isLoading, stopTracking } = useServerTokenTracking({
    //@ts-ignore
    startRequest: startProposal,
    //@ts-ignore
    queryRequest: queryProposal,
    //@ts-ignore
    endRequest: endProposal,
    tokenKey: "marketingProposal",
    onEndResponse: handleEndResponse,
    isLocalOnEndResponse: true,
    geneationType: false,
  });

  useEffect(() => {
    if (regeneration && !isLoading) {
      startAndTrack({
        businessName: regeneration.businessName,
        businessWebsite: regeneration.businessWebsite,
      });
      showSuccessToast({ title: "Creating proposal" });
    } else if (regeneration && isLoading) {
      showWarningToast({ title: "Proposal already in progress" });
    }
    if (regeneration) {
      dispatch(updateRegeneration(null));
    }
  }, [regeneration]);

  return (
    <div className="bg-gray-200 rounded-lg p-6 w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative">
      {isLoading && (
        <div className="absolute inset-0 rounded-lg flex flex-col items-center justify-center bg-[#FFFFFFFA] z-50">
          <LoadingAnimation width={80} height={80} />
          <div className="text-black font-bold mt-4 text-lg">
            Creating Proposal...
          </div>
          {/* <div
            className="text-blue-400 text-xs mt-1 cursor-pointer underline"
            onClick={stopTracking}
          >
            Cancel
          </div> */}
          <div className="mt-2">
            <MinimalBuildingProgress
              minutes={4}
              seconds={0}
              progressCss={
                "bg-primary h-4 rounded-full w-12/12 animated-progress"
              }
            />
          </div>
        </div>
      )}
      <div>
        <Formik
          initialValues={{
            businessName: "",
            businessWebsite: "https://",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
            try {
              const businessName = values.businessName;
              const businessWebsite = values.businessWebsite;

              if (
                !businessWebsite.startsWith("http://") &&
                !businessWebsite.startsWith("https://")
              ) {
                showErrorToast("Website must start with http:// or https//");
                return;
              }

              startAndTrack({ businessName, businessWebsite });

              //setResetFormFunc(resetForm);
            } catch (error) {
              console.error(error);
              //@ts-ignore
              showErrorToast(
                //@ts-ignore
                error && error.data.error ? (error as any).data.error : error
              );
            }
          }}
        >
          {({ isSubmitting, touched, errors, resetForm }) => {
            useEffect(() => {
              if (shouldReset) {
                setShouldReset(false);
                resetForm();
              }
            }, [shouldReset]);

            return (
              <Form className="relative">
                <div className="grid grid-cols-1 w-full">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`
													w-full
													${touched.businessName && errors.businessName ? "has-error" : ""}
												`}
                    >
                      <label htmlFor="businessName" className={`text-black`}>
                        Business Name
                      </label>
                      <Field
                        name="businessName"
                        type="text"
                        id="businessName"
                        className="form-input w-full"
                        style={{
                          backgroundColor: "white",
                          color: "#333333",
                        }}
                      />
                      {/* <ErrorMessage
													name="businessName"
													component="div"
													className="mt-1 text-danger"
												/> */}
                    </div>
                    <div
                      className={`w-full mt-4 ${touched.businessWebsite && errors.businessWebsite ? "has-error" : ""}`}
                    >
                      <label htmlFor="businessWebsite" className={`text-black`}>
                        Business Website
                      </label>
                      <Field
                        name="businessWebsite"
                        type="text"
                        id="businessWebsite"
                        className="form-input w-full"
                        style={{
                          backgroundColor: "white",
                          color: "#333333",
                        }}
                      />
                      {/* <ErrorMessage
													name="businessWebsite"
													component="div"
													className="mt-1 text-danger"
												/> */}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`rounded-lg bg-primary px-4 py-2 text-white w-full h-full flex items-center justify-center text-lg`}
                    >
                      {isSubmitting ? "Creating..." : "Create Proposal 🪄"}
                    </button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
      <div className="hidden md:block">
        <div
          className="bg-gray-200 relative w-full h-full rounded-lg"
          style={{
            background:
              "url(/assets/images/proposal_banner.webp) center / cover no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-[#000000CC] p-6 rounded-lg">
            <h1 className="text-white text-xl font-bold">
              Create instant, personalized marketing plans for businesses
            </h1>
            <h2 className="mt-4 text-white text-xs font-bold italic">
              - Introduction
              <br />
              - Magic Hooks
              <br />
              - Scroll-Stopping Ads
              <br />
              - FAQs, Benefits, Bonuses
              <br />- Page Speed Analysis
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalForm;
