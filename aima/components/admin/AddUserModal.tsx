import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAdminApiClient } from "@/hooks/useAdminApiClient";
import Modal from "@/components/Modal";
import Select, { MenuProps, components } from "react-select";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { generatePassword } from "@/utils/passwordGenerator";
import { userRoleOptions } from "@/utils/roles";

interface AddUserModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onUserAdded: () => void;
  jwtToken: string;
}

interface UserRolesData {
  [key: string]: { value: string; label: string }[];
}

const customScrollBarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 0.5rem;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: #F3F4F6;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #9CA3AF;
    border-radius: 0.25rem;
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: #6B7280;
  }
`;
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  roles: Yup.array()
    .of(
      Yup.object().shape({
        value: Yup.string().required("Role value is required"),
        label: Yup.string().required("Role label is required"),
      })
    )
    .required("At least one role is required"),
  // make days as optional number field
  days: Yup.number().when("roles", {
    is: (roles: any) => roles.some((role: any) => role.value === "exempt"),
    then: Yup.number()
      .required("Expiry date is required for exempt users")
      .max(180, "Maximum of 180 days allowed"),
    otherwise: Yup.number().optional(),
  }),

  // roles: Yup.array()
  //   .of(
  //     Yup.object().shape({
  //       value: Yup.string().required("Role value is required"),
  //       label: Yup.string().required("Role label is required"),
  //     }),
  //   )
  //   .min(1, "At least one role is required"),
});
const CustomMenu: React.FC<MenuProps> = props => {
  return (
    <div>
      <components.Menu
        className="custom-scrollbar max-h-24 overflow-y-auto rounded-md shadow-md"
        {...props}
      />
    </div>
  );
};

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onRequestClose,
  onUserAdded,
  jwtToken,
}) => {
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(true);
  const { useAddUserMutation } = useAdminApiClient(jwtToken);
  const [addUser] = useAddUserMutation();

  const [selectedRoles, setSelectedRoles] = useState<
    { value: string; label: string }[]
  >([]);

  const handleRoleChange = (selectedOptions: any) => {
    setSelectedRoles(selectedOptions);
  };

  useEffect(() => {
    if (isOpen) {
      const newPassword = generatePassword(10);
      setGeneratedPassword(newPassword);
    }
  }, [isOpen]);
  const stopPropagation = (event: any) => {
    event.stopPropagation();
  };
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div>
        <h2 className="mb-4 text-lg font-bold text-white">Add User</h2>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: generatedPassword,
            roles: selectedRoles ? selectedRoles : [],
            days: undefined,
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const roles = selectedRoles.map(role => role.value);
              if (selectedRoles.length === 0) {
                setErrors({
                  roles: "At least one role is required",
                });
                return;
              }

              if (selectedRoles.some(role => role.value === "exempt")) {
                if (!values.days) {
                  setErrors({
                    days: "Expiry date is required for exempt users",
                  });
                  return;
                } else if (values.days > 180) {
                  setErrors({
                    days: "Maximum of 180 days allowed",
                  });
                  return;
                }
              }
              const data = await addUser({
                ...values,
                roles,
              }).unwrap();

              onUserAdded();
              if (data) {
                await showSuccessToast({ title: data.message });
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
          {({ isSubmitting, touched, errors }) => (
            <Form>
              <div className="   space-y-4">
                <div
                  className={
                    touched.firstName && errors.firstName ? "has-error" : ""
                  }
                >
                  <label htmlFor="firstName" className="text-white">
                    First Name
                  </label>
                  <Field
                    name="firstName"
                    type="text"
                    id="firstName"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>

                {/* <div>
                  <label className="mb-2 block text-sm font-bold">
                    First Name
                  </label>
                  <Field
                    type="text"
                    name="firstName"
                    className="w-full rounded border border-gray-300 p-2"
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div> */}
                <div
                  className={
                    touched.lastName && errors.lastName ? "has-error" : ""
                  }
                >
                  <label htmlFor="lastName" className=" text-white">
                    Last Name
                  </label>
                  <Field
                    name="lastName"
                    type="text"
                    id="lastName"
                    className="form-input"
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>

                <div
                  className={touched.email && errors.email ? "has-error" : ""}
                >
                  <label htmlFor="email" className=" text-white">
                    Email
                  </label>
                  <div className="flex">
                    <Field
                      name="email"
                      type="text"
                      id="email"
                      className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="mt-1 text-danger"
                  />
                </div>
                <div className="custom-select">
                  <label className="mb-2 block text-sm font-bold text-white">
                    Roles
                  </label>

                  <div className="custom-select" onScroll={stopPropagation}>
                    <Select
                      options={userRoleOptions}
                      name="roles"
                      value={selectedRoles}
                      onChange={handleRoleChange}
                      className="  text-gray-200"
                      placeholder="Select roles"
                      isMulti
                      isClearable={true}
                      isSearchable={true}
                      menuPlacement="bottom"
                      maxMenuHeight={250}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: base => ({
                          ...base,
                          zIndex: 9999,
                        }),
                        menu: provided => ({
                          ...provided,
                          backgroundColor: "#1b2e4b",
                          color: "#808080",
                        }),
                      }}
                    />
                  </div>

                  <ErrorMessage
                    name="roles"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
                <div
                  className={
                    touched.password && errors.password ? "has-error" : ""
                  }
                >
                  <label className="mb-2 block text-sm font-bold text-white">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z"
                            stroke="#FFFFFF"
                            stroke-width="1.5"
                          />
                          <path
                            d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                            stroke="#FFFFFF"
                            stroke-width="1.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.68936 6.70456C2.52619 6.32384 2.08528 6.14747 1.70456 6.31064C1.32384 6.47381 1.14747 6.91472 1.31064 7.29544L2.68936 6.70456ZM15.5872 13.3287L15.3125 12.6308L15.5872 13.3287ZM9.04145 13.7377C9.26736 13.3906 9.16904 12.926 8.82185 12.7001C8.47466 12.4742 8.01008 12.5725 7.78417 12.9197L9.04145 13.7377ZM6.37136 15.091C6.14545 15.4381 6.24377 15.9027 6.59096 16.1286C6.93815 16.3545 7.40273 16.2562 7.62864 15.909L6.37136 15.091ZM22.6894 7.29544C22.8525 6.91472 22.6762 6.47381 22.2954 6.31064C21.9147 6.14747 21.4738 6.32384 21.3106 6.70456L22.6894 7.29544ZM19 11.1288L18.4867 10.582V10.582L19 11.1288ZM19.9697 13.1592C20.2626 13.4521 20.7374 13.4521 21.0303 13.1592C21.3232 12.8663 21.3232 12.3914 21.0303 12.0985L19.9697 13.1592ZM11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5H11.25ZM16.3714 15.909C16.5973 16.2562 17.0619 16.3545 17.409 16.1286C17.7562 15.9027 17.8545 15.4381 17.6286 15.091L16.3714 15.909ZM5.53033 11.6592C5.82322 11.3663 5.82322 10.8914 5.53033 10.5985C5.23744 10.3056 4.76256 10.3056 4.46967 10.5985L5.53033 11.6592ZM2.96967 12.0985C2.67678 12.3914 2.67678 12.8663 2.96967 13.1592C3.26256 13.4521 3.73744 13.4521 4.03033 13.1592L2.96967 12.0985ZM12 13.25C8.77611 13.25 6.46133 11.6446 4.9246 9.98966C4.15645 9.16243 3.59325 8.33284 3.22259 7.71014C3.03769 7.3995 2.90187 7.14232 2.8134 6.96537C2.76919 6.87696 2.73689 6.80875 2.71627 6.76411C2.70597 6.7418 2.69859 6.7254 2.69411 6.71533C2.69187 6.7103 2.69036 6.70684 2.68957 6.70503C2.68917 6.70413 2.68896 6.70363 2.68892 6.70355C2.68891 6.70351 2.68893 6.70357 2.68901 6.70374C2.68904 6.70382 2.68913 6.70403 2.68915 6.70407C2.68925 6.7043 2.68936 6.70456 2 7C1.31064 7.29544 1.31077 7.29575 1.31092 7.29609C1.31098 7.29624 1.31114 7.2966 1.31127 7.2969C1.31152 7.29749 1.31183 7.2982 1.31218 7.299C1.31287 7.30062 1.31376 7.30266 1.31483 7.30512C1.31698 7.31003 1.31988 7.31662 1.32353 7.32483C1.33083 7.34125 1.34115 7.36415 1.35453 7.39311C1.38127 7.45102 1.42026 7.5332 1.47176 7.63619C1.57469 7.84206 1.72794 8.13175 1.93366 8.47736C2.34425 9.16716 2.96855 10.0876 3.8254 11.0103C5.53867 12.8554 8.22389 14.75 12 14.75V13.25ZM15.3125 12.6308C14.3421 13.0128 13.2417 13.25 12 13.25V14.75C13.4382 14.75 14.7246 14.4742 15.8619 14.0266L15.3125 12.6308ZM7.78417 12.9197L6.37136 15.091L7.62864 15.909L9.04145 13.7377L7.78417 12.9197ZM22 7C21.3106 6.70456 21.3107 6.70441 21.3108 6.70427C21.3108 6.70423 21.3108 6.7041 21.3109 6.70402C21.3109 6.70388 21.311 6.70376 21.311 6.70368C21.3111 6.70352 21.3111 6.70349 21.3111 6.7036C21.311 6.7038 21.3107 6.70452 21.3101 6.70576C21.309 6.70823 21.307 6.71275 21.3041 6.71924C21.2983 6.73223 21.2889 6.75309 21.2758 6.78125C21.2495 6.83757 21.2086 6.92295 21.1526 7.03267C21.0406 7.25227 20.869 7.56831 20.6354 7.9432C20.1669 8.69516 19.4563 9.67197 18.4867 10.582L19.5133 11.6757C20.6023 10.6535 21.3917 9.56587 21.9085 8.73646C22.1676 8.32068 22.36 7.9668 22.4889 7.71415C22.5533 7.58775 22.602 7.48643 22.6353 7.41507C22.6519 7.37939 22.6647 7.35118 22.6737 7.33104C22.6782 7.32097 22.6818 7.31292 22.6844 7.30696C22.6857 7.30398 22.6867 7.30153 22.6876 7.2996C22.688 7.29864 22.6883 7.29781 22.6886 7.29712C22.6888 7.29677 22.6889 7.29646 22.689 7.29618C22.6891 7.29604 22.6892 7.29585 22.6892 7.29578C22.6893 7.29561 22.6894 7.29544 22 7ZM18.4867 10.582C17.6277 11.3882 16.5739 12.1343 15.3125 12.6308L15.8619 14.0266C17.3355 13.4466 18.5466 12.583 19.5133 11.6757L18.4867 10.582ZM18.4697 11.6592L19.9697 13.1592L21.0303 12.0985L19.5303 10.5985L18.4697 11.6592ZM11.25 14V16.5H12.75V14H11.25ZM14.9586 13.7377L16.3714 15.909L17.6286 15.091L16.2158 12.9197L14.9586 13.7377ZM4.46967 10.5985L2.96967 12.0985L4.03033 13.1592L5.53033 11.6592L4.46967 10.5985Z"
                            fill="#FFFFFF"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-sm text-red-500"
                  />
                </div>
                <div
                  className={touched?.days && errors?.days ? "has-error" : ""}
                >
                  <label className="mb-2 block text-sm font-bold text-white">
                    Expire Days (Optional)
                  </label>
                  <div className="relative">
                    <Field
                      type={"number"}
                      name="days"
                      className="form-input pr-10"
                    />
                  </div>
                  <ErrorMessage
                    name="days"
                    component="div"
                    className="text-sm text-red-500"
                  />
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
                  {isSubmitting ? "Adding..." : "Add User"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default AddUserModal;
