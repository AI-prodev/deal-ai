import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "tippy.js/dist/tippy.css";
import { FieldWithLabel } from "../marketingHooks/FieldWithLabel";
import RangeSlider from "../marketingHooks/RangeSlider";
import { ICampaign } from "@/interfaces/ICampaign";
import { CountryCode, countryCodes } from "@/utils/data/Countries";
import { useUpdateCampaignMutation } from "@/store/features/campaignApi";
import { showSuccessToast } from "@/utils/toast";
import { getOwnedPagesForBusiness } from "@/store/features/facebookApi";
import MultiRangeSlider from "../MultiRangeSlider";

interface BusinessPage {
  id: string;
  name: string;
}

// Validation Schema using Yup
const formatUrl = (url: string) => {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
};
const CampaignFormValidation = Yup.object().shape({
  title: Yup.string().required("Please enter the campaign name"),
  budget: Yup.number()
    .required("Budget is required")
    .positive("Budget must be positive"),
  targetURL: Yup.string()
    .required("Target URL is required")
    .transform(value => formatUrl(value))
    .url("Invalid URL"),
  displayLink: Yup.string()
    .transform(value => formatUrl(value))
    .url("Invalid URL"),
  facebookPage: Yup.string()
    .transform(value => formatUrl(value))
    .url("Invalid URL"),
  instagramPage: Yup.string()
    .transform(value => formatUrl(value))
    .url("Invalid URL"),
  callToAction: Yup.string(),
  headline: Yup.string(),
  targetingGender: Yup.string(),
  targetingCountry: Yup.string(),
  optimizationGoal: Yup.string().required("Please choose atleast one goal"),
  billingEvent: Yup.string().required("Please choose atleast one event"),
  pageId: Yup.string().required("Please choose atleast one page"),
});

const CampaignForms = ({
  campaign,
  refetch,
}: {
  campaign: ICampaign;
  refetch: any;
}) => {
  // Billing Events
  const billingEvents = [
    { name: "App Installs", value: "IMPRESSIONS" },
    { name: "Brand Awareness", value: "IMPRESSIONS" },
    { name: "Conversions", value: "CONVERSIONS" },
    { name: "Event Responses", value: "IMPRESSIONS" },
    { name: "Lead Generation", value: "IMPRESSIONS" },
    { name: "Link Clicks", value: "LINK_CLICKS" },
    { name: "Local Awareness", value: "IMPRESSIONS" },
    { name: "Messages", value: "IMPRESSIONS" },
    { name: "Offer Claims", value: "IMPRESSIONS" },
    { name: "App Promotion", value: "IMPRESSIONS" },
    { name: "Awareness", value: "IMPRESSIONS" },
    { name: "Engagement", value: "IMPRESSIONS" },
    { name: "Leads", value: "IMPRESSIONS" },
    { name: "Sales", value: "IMPRESSIONS" },
    { name: "Traffic", value: "IMPRESSIONS" },
    { name: "Page Likes", value: "IMPRESSIONS" },
    { name: "Post Engagement", value: "IMPRESSIONS" },
    { name: "Product Catalog Sales", value: "CONVERSIONS" },
    { name: "Reach", value: "IMPRESSIONS" },
    { name: "Store Visits", value: "IMPRESSIONS" },
    { name: "Video Views", value: "IMPRESSIONS" },
    { name: "ThruPlay", value: "THRUPLAY" },
    {
      name: "Two Seconds Video",
      value: "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS",
    },
  ];

  // Optimization Goals
  const optimizationGoals = [
    { name: "None", value: "NONE" },
    { name: "App Installs", value: "APP_INSTALLS" },
    { name: "Ad Recall Lift", value: "AD_RECALL_LIFT" },
    { name: "Engaged Users", value: "ENGAGED_USERS" },
    { name: "Event Responses", value: "EVENT_RESPONSES" },
    { name: "Impressions", value: "IMPRESSIONS" },
    { name: "Lead Generation", value: "LEAD_GENERATION" },
    { name: "Link Clicks", value: "LINK_CLICKS" },
    { name: "Offsite Conversions", value: "OFFSITE_CONVERSIONS" },
    { name: "Page Likes", value: "PAGE_LIKES" },
    { name: "Post Engagement", value: "POST_ENGAGEMENT" },
    { name: "Quality Call", value: "QUALITY_CALL" },
    { name: "Reach", value: "REACH" },
    { name: "Replies", value: "REPLIES" },
    { name: "Social Impressions", value: "VISIT_INSTAGRAM_PROFILE" },
    { name: "ThruPlay", value: "THRUPLAY" },
    {
      name: "Two Seconds Video",
      value: "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS",
    },
    { name: "Value", value: "VALUE" },
    { name: "Landing Page Views", value: "LANDING_PAGE_VIEWS" },
  ];

  const [updateCampaign] = useUpdateCampaignMutation();

  const [businessPages, setBusinessPages] = useState<Array<BusinessPage>>([]);

  const initialFormValues = {
    title: campaign?.title,
    budget: campaign?.budget || 0,
    targetURL: campaign?.targetURL || "",
    displayLink: campaign?.displayLink || "",
    facebookPage: campaign?.page?.facebook || "",
    instagramPage: campaign?.page?.instagram || "",
    callToAction: campaign?.callToAction || "Learn More",
    headline: campaign?.headline || "See How It Works",
    targetingMinAge: campaign?.targeting?.minAge || 18,
    targetingMaxAge: campaign?.targeting?.maxAge || 100,
    targetingGender: campaign?.targeting?.gender || "both",
    targetingCountry: campaign?.targeting?.country || "US",
    billingEvent: campaign?.billingEvent || "",
    optimizationGoal: campaign?.optimizationGoal || "",
    pageId: campaign?.pageId || "",
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      page: {
        facebook: values.facebookPage,
        instagram: values.instagramPage,
      },
      targeting: {
        minAge: values.targetingMinAge,
        maxAge: values.targetingMaxAge,
        gender: values.targetingGender,
        country: values.targetingCountry,
      },
      fbCampaignId: campaign?.fbCampaignId,
      accessToken: campaign?.businessDetails?.accountDetails?.accessToken,
      adAccountId: campaign?.adAccountId,
    };

    const data = await updateCampaign({ _id: campaign._id, ...payload });

    if ("error" in data) {
      console.error(data?.error);
    } else {
      showSuccessToast({ title: "Campaign updated successfully" });
      refetch();
    }
  };

  const getBusinessPages = async () => {
    await getOwnedPagesForBusiness(
      campaign?.businessDetails?.businessId.toString(),
      campaign?.businessDetails?.accountDetails?.accessToken
    )
      .then(result => {
        setBusinessPages(result);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const uniqueCountryCodes = countryCodes.reduce((acc, current) => {
    const x = acc.find((item: CountryCode) => item.code === current.code);
    if (!x) {
      //@ts-ignore
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  useEffect(() => {
    if (campaign) {
      getBusinessPages();
    }
  }, [campaign]);

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={CampaignFormValidation}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, values, setFieldValue, isValid }) => {
        return (
          <Form className="space-y-5 text-white">
            {/* Campaign Name Field */}
            <FieldWithLabel
              className="form-input"
              name="title"
              label="Campaign Name"
              component="input"
              placeholder="Enter Campaign Name"
            />
            {touched.title && errors.title && (
              <div className="text-red-500">{errors.title}</div>
            )}

            <FieldWithLabel
              className="form-input"
              name="budget"
              label="Budget"
              component="input"
              type="number"
              placeholder="Enter Budget"
            />
            {touched.budget && errors.budget && (
              <div className="text-red-500">{errors.budget}</div>
            )}

            <div className="mb-4">
              <label htmlFor="language" className="font-semibold text-white">
                Choose Page
              </label>
              <Field
                as="select"
                name="language"
                className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const selectedEvent = e.target.value;

                  setFieldValue("pageId", selectedEvent);
                }}
                value={values.pageId}
              >
                <option value="" disabled selected>
                  Select an Page
                </option>

                {businessPages.map((business, index) => (
                  <option key={index} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </Field>
            </div>

            {touched.billingEvent && errors.billingEvent && (
              <div className="text-red-500">{errors.billingEvent}</div>
            )}

            <div className="mb-4">
              <label htmlFor="language" className="font-semibold text-white">
                Choose Billing Event
              </label>
              <Field
                as="select"
                name="language"
                className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const selectedEvent = e.target.value;

                  setFieldValue("optimizationGoal", "");

                  setFieldValue("billingEvent", selectedEvent);
                }}
                defaultValue={values.billingEvent}
              >
                <option value="" disabled selected>
                  Select an Event
                </option>

                {billingEvents.map((event, index) => (
                  <option key={index} value={event.value}>
                    {event.name}
                  </option>
                ))}
              </Field>
            </div>

            {touched.billingEvent && errors.billingEvent && (
              <div className="text-red-500">{errors.billingEvent}</div>
            )}

            <div className="mb-4">
              <label htmlFor="language" className="font-semibold text-white">
                Choose Optimization Goal
              </label>
              <Field
                as="select"
                name="language"
                className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const selectedEvent = e.target.value;

                  setFieldValue("optimizationGoal", selectedEvent);
                }}
                value={values.optimizationGoal}
              >
                <option value="" disabled selected>
                  Select an Goal
                </option>

                {values.billingEvent === "IMPRESSIONS"
                  ? optimizationGoals.map((goal, index) => (
                      <option key={index} value={goal.value}>
                        {goal.name}
                      </option>
                    ))
                  : values.billingEvent === "LINK_CLICKS"
                    ? optimizationGoals
                        .filter(goal => goal.value === "LINK_CLICKS")
                        .map((goal, index) => (
                          <option key={index} value={goal.value}>
                            {goal.name}
                          </option>
                        ))
                    : values.billingEvent === "THRUPLAY"
                      ? optimizationGoals
                          .filter(goal => goal.value === "THRUPLAY")
                          .map((goal, index) => (
                            <option key={index} value={goal.value}>
                              {goal.name}
                            </option>
                          ))
                      : values.billingEvent ===
                          "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS"
                        ? optimizationGoals
                            .filter(
                              goal =>
                                goal.value ===
                                "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS"
                            )
                            .map((goal, index) => (
                              <option key={index} value={goal.value}>
                                {goal.name}
                              </option>
                            ))
                        : null}
              </Field>
            </div>

            {touched.optimizationGoal && errors.optimizationGoal && (
              <div className="text-red-500">{errors.optimizationGoal}</div>
            )}

            <FieldWithLabel
              className="form-input"
              name="targetURL"
              label="Target URL"
              component="input"
              placeholder="Enter Target URL"
            />
            {touched.targetURL && errors.targetURL && (
              <div className="text-red-500">{errors.targetURL}</div>
            )}

            <FieldWithLabel
              className="form-input"
              name="displayLink"
              label="Display Link"
              component="input"
              placeholder="Enter Display Link"
            />
            {touched.displayLink && errors.displayLink && (
              <div className="text-red-500">{errors.displayLink}</div>
            )}

            <FieldWithLabel
              className="form-input"
              name="instagramPage"
              label="Instagram Page"
              component="input"
              placeholder="Enter Instagram Page"
            />
            {touched.instagramPage && errors.instagramPage && (
              <div className="text-red-500">{errors.instagramPage}</div>
            )}

            <FieldWithLabel
              className="form-input"
              name="callToAction"
              label="Call To Action"
              component="select"
            >
              <option value="Learn More">Learn More</option>
            </FieldWithLabel>
            {touched.callToAction && errors.callToAction && (
              <div className="text-red-500">{errors.callToAction}</div>
            )}

            <FieldWithLabel
              className="form-input"
              name="headline"
              label="Headline"
              component="input"
              placeholder="Enter Headline"
            />
            {touched.headline && errors.headline && (
              <div className="text-red-500">{errors.headline}</div>
            )}

            <MultiRangeSlider
              label="Targeting Age"
              name="targetingAge"
              minAge={values.targetingMinAge}
              maxAge={values.targetingMaxAge}
              setFieldValue={setFieldValue}
            />

            <FieldWithLabel
              name="targetingGender"
              label="Targeting Gender"
              component="select"
              className="form-input"
            >
              <option value="both">Both</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </FieldWithLabel>
            {touched.targetingGender && errors.targetingGender && (
              <div className="text-red-500">{errors.targetingGender}</div>
            )}

            <div>
              <label htmlFor="targetingCountry" className="form-label">
                Targeting Country
              </label>
              <Field
                as="select"
                name="targetingCountry"
                className="form-input"
                onChange={(e: any) =>
                  setFieldValue("targetingCountry", e.target.value)
                }
              >
                {uniqueCountryCodes.map((country: CountryCode) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Field>
            </div>
            {touched.targetingCountry && errors.targetingCountry && (
              <div className="text-red-500">{errors.targetingCountry}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!isValid}
            >
              Update Campaign
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CampaignForms;
