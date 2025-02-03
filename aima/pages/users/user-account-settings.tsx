import Link from "next/link";
import { useRef, useState } from "react";

import * as Yup from "yup";

import withAuth from "@/helpers/withAuth";

import ProfileUpdate from "@/components/profile/ProfileUpdate";
import { ALL_ROLES } from "@/utils/roles";
import Settings from "../apps/settings/manage";
import Head from "next/head";

type AccountSettingProps = {};

const AccountSetting = ({}: AccountSettingProps) => {
  const [tabs, setTabs] = useState<string>(() => {
    const hash = window.location.hash.substr(1);
    return hash || "home";
  });

  const toggleTabs = (name: string) => {
    setTabs(name);
    window.location.hash = name;
  };

  return (
    <>
      <Head>
        <title>Account Setting</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Users
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Account Settings</span>
          </li>
        </ul>
        <div className="pt-5">
          <div className="mb-5 flex items-center justify-between">
            <h5 className="text-lg font-semibold dark:text-white-light">
              Settings
            </h5>
          </div>
          <hr className="mb-5 overflow-y-auto whitespace-nowrap border border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex" />
          <div>
            <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("home")}
                  className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                    tabs === "home" ? "!border-primary text-primary" : ""
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="6"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <ellipse
                      opacity="0.5"
                      cx="12"
                      cy="17"
                      rx="7"
                      ry="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  Profile
                </button>
              </li>
              {/* <li className="inline-block">
              <button
                onClick={() => toggleTabs("saved-thesis")}
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "saved-thesis" ? "!border-primary text-primary" : ""
                }`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Saved Thesis
              </button>
            </li>
            <li className="inline-block">
              <button
                onClick={() => toggleTabs("saved-explore")}
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "saved-explore" ? "!border-primary text-primary" : ""
                }`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Saved Explore
              </button>
            </li> */}
              <li className="inline-block">
                <button
                  onClick={() => toggleTabs("subscriptions")}
                  className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                    tabs === "subscriptions"
                      ? "!border-primary text-primary"
                      : ""
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                  >
                    <circle
                      opacity="0.5"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 6V18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Subscriptions
                </button>
              </li>
              {/* <li className="inline-block">
              <button
                onClick={() => toggleTabs("preferences")}
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "preferences" ? "!border-primary text-primary" : ""
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="6"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <ellipse
                    opacity="0.5"
                    cx="12"
                    cy="17"
                    rx="7"
                    ry="4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Preferences
              </button>
            </li>
            <li className="inline-block">
              <button
                onClick={() => toggleTabs("danger-zone")}
                className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                  tabs === "danger-zone" ? "!border-primary text-primary" : ""
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.00659 6.93309C5.04956 5.7996 5.70084 4.77423 6.53785 3.93723C7.9308 2.54428 10.1532 2.73144 11.0376 4.31617L11.6866 5.4791C12.2723 6.52858 12.0372 7.90533 11.1147 8.8278M17.067 18.9934C18.2004 18.9505 19.2258 18.2992 20.0628 17.4622C21.4558 16.0692 21.2686 13.8468 19.6839 12.9624L18.5209 12.3134C17.4715 11.7277 16.0947 11.9628 15.1722 12.8853"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    opacity="0.5"
                    d="M5.00655 6.93311C4.93421 8.84124 5.41713 12.0817 8.6677 15.3323C11.9183 18.5829 15.1588 19.0658 17.0669 18.9935M15.1722 12.8853C15.1722 12.8853 14.0532 14.0042 12.0245 11.9755C9.99578 9.94676 11.1147 8.82782 11.1147 8.82782"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Danger Zone
              </button>
            </li> */}
            </ul>
          </div>
          {tabs === "home" ? <ProfileUpdate /> : ""}

          {tabs === "subscriptions" ? <Settings /> : ""}
          {/*   
        {tabs === "saved-thesis" ? (
          <>
            <FavoriteThesis />
          </>
        ) : (
          ""
        )}

        {tabs === "saved-explore" ? (
          <>
            <FavoriteExplore />
          </>
        ) : (
          ""
        )} */}
          {tabs === "payment-details" ? (
            <div>
              <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="panel">
                  <div className="mb-5">
                    <h5 className="mb-4 text-lg font-semibold">
                      Billing Address
                    </h5>
                    <p>
                      Changes to your{" "}
                      <span className="text-primary">Billing</span> information
                      will take effect starting with scheduled payment and will
                      be refelected on your next invoice.
                    </p>
                  </div>
                  <div className="mb-5">
                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                      <div className="flex items-start justify-between py-3">
                        <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                          Address #1
                          <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">
                            2249 Caynor Circle, New Brunswick, New Jersey
                          </span>
                        </h6>
                        <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                          <button className="btn btn-dark">Edit</button>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                      <div className="flex items-start justify-between py-3">
                        <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                          Address #2
                          <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">
                            4262 Leverton Cove Road, Springfield, Massachusetts
                          </span>
                        </h6>
                        <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                          <button className="btn btn-dark">Edit</button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start justify-between py-3">
                        <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                          Address #3
                          <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">
                            2692 Berkshire Circle, Knoxville, Tennessee
                          </span>
                        </h6>
                        <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                          <button className="btn btn-dark">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary">Add Address</button>
                </div>
                <div className="panel">
                  <div className="mb-5">
                    <h5 className="mb-4 text-lg font-semibold">
                      Payment History
                    </h5>
                    <p>
                      Changes to your{" "}
                      <span className="text-primary">Payment Method</span>{" "}
                      information will take effect starting with scheduled
                      payment and will be refelected on your next invoice.
                    </p>
                  </div>
                  <div className="mb-5">
                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                      <div className="flex items-start justify-between py-3">
                        <div className="flex-none ltr:mr-4 rtl:ml-4">
                          <img
                            src="/assets/images/card-americanexpress.svg"
                            alt="img"
                          />
                        </div>
                        <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                          Mastercard
                          <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">
                            XXXX XXXX XXXX 9704
                          </span>
                        </h6>
                        <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                          <button className="btn btn-dark">Edit</button>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                      <div className="flex items-start justify-between py-3">
                        <div className="flex-none ltr:mr-4 rtl:ml-4">
                          <img
                            src="/assets/images/card-mastercard.svg"
                            alt="img"
                          />
                        </div>
                        <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                          American Express
                          <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">
                            XXXX XXXX XXXX 310
                          </span>
                        </h6>
                        <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                          <button className="btn btn-dark">Edit</button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start justify-between py-3">
                        <div className="flex-none ltr:mr-4 rtl:ml-4">
                          <img src="/assets/images/card-visa.svg" alt="img" />
                        </div>
                        <h6 className="text-[15px] font-bold text-[#515365] dark:text-white-dark">
                          Visa
                          <span className="mt-1 block text-xs font-normal text-white-dark dark:text-white-light">
                            XXXX XXXX XXXX 5264
                          </span>
                        </h6>
                        <div className="flex items-start justify-between ltr:ml-auto rtl:mr-auto">
                          <button className="btn btn-dark">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary">
                    Add Payment Method
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="panel">
                  <div className="mb-5">
                    <h5 className="mb-4 text-lg font-semibold">
                      Add Billing Address
                    </h5>
                    <p>
                      Changes your New{" "}
                      <span className="text-primary">Billing</span> Information.
                    </p>
                  </div>
                  <div className="mb-5">
                    <form>
                      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="billingName">Name</label>
                          <input
                            id="billingName"
                            type="text"
                            placeholder="Enter Name"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="billingEmail">Email</label>
                          <input
                            id="billingEmail"
                            type="email"
                            placeholder="Enter Email"
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="mb-5">
                        <label htmlFor="billingAddress">Address</label>
                        <input
                          id="billingAddress"
                          type="text"
                          placeholder="Enter Address"
                          className="form-input"
                        />
                      </div>
                      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        <div className="md:col-span-2">
                          <label htmlFor="billingCity">City</label>
                          <input
                            id="billingCity"
                            type="text"
                            placeholder="Enter City"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="billingState">State</label>
                          <select
                            id="billingState"
                            className="form-select text-white-dark"
                          >
                            <option>Choose...</option>
                            <option>...</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="billingZip">Zip</label>
                          <input
                            id="billingZip"
                            type="text"
                            placeholder="Enter Zip"
                            className="form-input"
                          />
                        </div>
                      </div>
                      <button type="button" className="btn btn-primary">
                        Add
                      </button>
                    </form>
                  </div>
                </div>
                <div className="panel">
                  <div className="mb-5">
                    <h5 className="mb-4 text-lg font-semibold">
                      Add Payment Method
                    </h5>
                    <p>
                      Changes your New{" "}
                      <span className="text-primary">Payment Method </span>
                      Information.
                    </p>
                  </div>
                  <div className="mb-5">
                    <form>
                      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="payBrand">Card Brand</label>
                          <select
                            id="payBrand"
                            className="form-select text-white-dark"
                          >
                            <option value="Mastercard">Mastercard</option>
                            <option value="American Express">
                              American Express
                            </option>
                            <option value="Visa">Visa</option>
                            <option value="Discover">Discover</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="payNumber">Card Number</label>
                          <input
                            id="payNumber"
                            type="text"
                            placeholder="Card Number"
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="payHolder">Holder Name</label>
                          <input
                            id="payHolder"
                            type="text"
                            placeholder="Holder Name"
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="payCvv">CVV/CVV2</label>
                          <input
                            id="payCvv"
                            type="text"
                            placeholder="CVV"
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="payExp">Card Expiry</label>
                          <input
                            id="payExp"
                            type="text"
                            placeholder="Card Expiry"
                            className="form-input"
                          />
                        </div>
                      </div>
                      <button type="button" className="btn btn-primary">
                        Add
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {tabs === "preferences" ? (
            <div className="switch">
              <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Choose Theme</h5>
                  <div className="flex justify-around">
                    <div className="flex">
                      <label className="inline-flex cursor-pointer">
                        <input
                          className="form-radio cursor-pointer ltr:mr-4 rtl:ml-4"
                          type="radio"
                          name="flexRadioDefault"
                          defaultChecked
                        />
                        <span>
                          <img
                            className="ms-3"
                            width="100"
                            height="68"
                            alt="settings-dark"
                            src="/assets/images/settings-light.svg"
                          />
                        </span>
                      </label>
                    </div>

                    <label className="inline-flex cursor-pointer">
                      <input
                        className="form-radio cursor-pointer ltr:mr-4 rtl:ml-4"
                        type="radio"
                        name="flexRadioDefault"
                      />
                      <span>
                        <img
                          className="ms-3"
                          width="100"
                          height="68"
                          alt="settings-light"
                          src="/assets/images/settings-dark.svg"
                        />
                      </span>
                    </label>
                  </div>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Activity data</h5>
                  <p>Download your Summary, Task and Payment History Data</p>
                  <button type="button" className="btn btn-primary">
                    Download Data
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Public Profile</h5>
                  <p>
                    Your <span className="text-primary">Profile</span> will be
                    visible to anyone on the network.
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox1"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Show my email</h5>
                  <p>
                    Your <span className="text-primary">Email</span> will be
                    visible to anyone on the network.
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox2"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4  before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">
                    Enable keyboard shortcuts
                  </h5>
                  <p>
                    When enabled, press{" "}
                    <span className="text-primary">ctrl</span> for help
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox3"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4  before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">
                    Hide left navigation
                  </h5>
                  <p>
                    Sidebar will be <span className="text-primary">hidden</span>{" "}
                    by default
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox4"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4  before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Advertisements</h5>
                  <p>
                    Display <span className="text-primary">Ads</span> on your
                    dashboard
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox5"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4  before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Social Profile</h5>
                  <p>
                    Enable your <span className="text-primary">social</span>{" "}
                    profiles on this network
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox6"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4  before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          {tabs === "danger-zone" ? (
            <div className="switch">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Purge Cache</h5>
                  <p>
                    Remove the active resource from the cache without waiting
                    for the predetermined cache expiry time.
                  </p>
                  <button className="btn btn-secondary">Clear</button>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">
                    Deactivate Account
                  </h5>
                  <p>
                    You will not be able to receive messages, notifications for
                    up to 24 hours.
                  </p>
                  <label className="relative h-6 w-12">
                    <input
                      type="checkbox"
                      className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0"
                      id="custom_switch_checkbox7"
                    />
                    <span className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                  </label>
                </div>
                <div className="panel space-y-5">
                  <h5 className="mb-4 text-lg font-semibold">Delete Account</h5>
                  <p>
                    Once you delete the account, there is no going back. Please
                    be certain.
                  </p>
                  <button className="btn btn-danger btn-delete-account">
                    Delete my account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default withAuth(AccountSetting, ALL_ROLES);

// export default AccountSetting;
