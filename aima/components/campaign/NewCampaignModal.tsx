import React, { useEffect, useState, ChangeEvent } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import Modal from "@/components/Modal";

import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

import { campaignApi } from "@/store/features/campaignApi";
import { accountApi } from "@/store/features/accountApi";
import { getAdAccountsForBusiness } from "@/store/features/facebookApi";

interface NewProjectModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onCreated: () => void;
}

interface Business {
  businessId: string;
  name: string;
}

interface AdAccount {
  id: string;
  account_id: any;
  name: string;
}
interface Token {
  // Define the properties of your Token interface here
  // For example:
  accessToken: string;
  businessId: string;
  adToken: string;
  objective: string;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
});
const NewCampaignModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onRequestClose,
  onCreated,
}) => {
  const [createCampign] = campaignApi.useCreateCampaignMutation();

  const { data: accounts = [], refetch: refetchaccounts } =
    accountApi.useGetAccountsQuery();

  const [filteredBusinesses, setFilteredBusinesses] = useState<Array<Business>>(
    []
  );
  const [filteredAdAccounts, setFilteredAdAccounts] = useState<
    Array<AdAccount>
  >([]);
  const [selectedAccessToken, setSelectedAccessToken] = useState<
    Token | string
  >("");
  const [selectedBusinessId, setSelectedBusinessId] = useState<Token | string>(
    ""
  );
  const [selectedObjective, setSelectedObjective] = useState<Token | string>(
    ""
  );
  const [selectedAdToken, setSelectedAdToken] = useState<string>("");
  const [campaignTitle, setCampaignTitle] = useState<string>("");

  const adCampaignObjectives = [
    { name: "App Promotion", value: "OUTCOME_APP_PROMOTION" },
    { name: "Awareness", value: "OUTCOME_AWARENESS" },
    { name: "Engagement", value: "OUTCOME_ENGAGEMENT" },
    { name: "Leads", value: "OUTCOME_LEADS" },
    { name: "Sales", value: "OUTCOME_SALES" },
    { name: "Traffic", value: "OUTCOME_TRAFFIC" },
  ];

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">New Campaign</h2>
        <Formik
          enableReinitialize
          initialValues={{
            title: campaignTitle,
            accessToken: selectedAccessToken,
            businessId: selectedBusinessId,
            adAccountId: selectedAdToken,
            objective: selectedObjective,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              //@ts-ignore
              const data = await createCampign({
                ...values,
              }).unwrap();
              onCreated();
              if (data) {
                showSuccessToast({
                  title: "Campaign created successfully",
                });
              }
              onRequestClose();
            } catch (error) {
              console.error(error);
              // prettier-ignore
              //@ts-ignore
              showErrorToast(
                                // prettier-ignore
                                //@ts-ignore
                                error && error.data.error? error.data.error: error
                            );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, touched, errors, setFieldValue }) => (
            <Form>
              <div className="space-y-4">
                <div className="mb-4">
                  <label
                    htmlFor="language"
                    className="font-semibold text-white"
                  >
                    Choose Account
                  </label>
                  <Field
                    as="select"
                    name="language"
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      const selectedAccountToken = e.target.value;

                      setSelectedBusinessId("");
                      setCampaignTitle("");
                      setSelectedAdToken("");
                      // Use the find method to get the first account that matches the token
                      const selectedAccount = accounts.find(
                        account =>
                          account?.accessToken?.toString() ===
                          selectedAccountToken.toString()
                      );

                      if (selectedAccount) {
                        setSelectedAccessToken(
                          selectedAccount?.accessToken ?? ""
                        );
                        setFilteredBusinesses(
                          selectedAccount?.businesses?.filter(
                            data => data?.isActive
                          ) ?? []
                        );
                      }
                    }}
                  >
                    <option value="" disabled selected>
                      Select an Account
                    </option>

                    {accounts.map((account, index) => (
                      <option key={index} value={account.accessToken}>
                        {account?.name}
                      </option>
                    ))}
                  </Field>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="language"
                    className="font-semibold text-white"
                  >
                    Choose Business
                  </label>
                  <Field
                    as="select"
                    name="language"
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={async (e: ChangeEvent<HTMLSelectElement>) => {
                      const selectedBusinessId = e.target.value;

                      setSelectedBusinessId(selectedBusinessId);
                      setSelectedAdToken("");

                      const adAccounts = await getAdAccountsForBusiness(
                        selectedBusinessId,
                        selectedAccessToken.toString()
                      );

                      if (adAccounts?.length > 0) {
                        setFilteredAdAccounts(adAccounts);
                      }
                    }}
                    value={selectedBusinessId}
                  >
                    <option value="" disabled selected>
                      Select an Business
                    </option>

                    {filteredBusinesses.map((business, index) => (
                      <option key={index} value={business.businessId}>
                        {business.name}
                      </option>
                    ))}
                  </Field>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="language"
                    className="font-semibold text-white"
                  >
                    Choose Ad Account
                  </label>
                  <Field
                    as="select"
                    name="language"
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={async (e: ChangeEvent<HTMLSelectElement>) => {
                      const selectedAdAccount = e.target.value;

                      setSelectedAdToken(selectedAdAccount);
                    }}
                    value={selectedAdToken}
                  >
                    <option value="" disabled selected>
                      Select an Ad Account
                    </option>

                    {filteredAdAccounts.map((account, index) => (
                      <option key={index} value={account?.id}>
                        {account?.name}
                      </option>
                    ))}
                  </Field>
                </div>

                <div
                  className={touched.title && errors.title ? "has-error" : ""}
                >
                  <label htmlFor="title" className="text-white">
                    Campaign Title
                  </label>
                  <Field
                    name="title"
                    type="text"
                    id="title"
                    className="form-input"
                    placeholder="Enter campaign title"
                    value={campaignTitle}
                    onChange={(e: { target: { value: any } }) =>
                      setCampaignTitle(e.target.value)
                    }
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="language"
                    className="font-semibold text-white"
                  >
                    Choose Campaign Objective
                  </label>
                  <Field
                    as="select"
                    name="language"
                    className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      const selectedObjective = e.target.value;

                      setSelectedObjective(selectedObjective?.toString());
                    }}
                  >
                    <option value="" disabled selected>
                      Select an Objective
                    </option>

                    {adCampaignObjectives.map((objective, index) => (
                      <option key={index} value={objective.value}>
                        {objective.name}
                      </option>
                    ))}
                  </Field>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
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
                  className="rounded bg-primary px-4 py-2 text-white"
                >
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default NewCampaignModal;
