import { useState, useEffect, ChangeEvent } from "react";
import Select, { OnChangeValue } from "react-select";

import Dropdown from "@/components/Dropdown";
import { useAdminApiClient } from "@/hooks/useAdminApiClient";
import { IUser } from "@/interfaces/IUser";
import Tippy from "@tippyjs/react";

import { getSession, useSession } from "next-auth/react";
import { GetServerSidePropsContext } from "next";
import withAuth from "@/helpers/withAuth";
import { useRouter } from "next/router";
import AddUserModal from "@/components/admin/AddUserModal";
import ResetUserPasswordModal from "@/components/admin/ResetUserPasswordModal";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { ADMIN_ROLES, userRoleOptions } from "@/utils/roles";
import StatsCard from "@/components/admin/StatsCard";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import Head from "next/head";
import { adminRoutes, useDashboard } from "@/hooks/useDashboard";

type OptionType = {
  label: string;
  value: string;
};
type DashBoardProps = {
  jwtToken: string;
};

type StatsType = {
  businessesVectorCount: number;
  landVectorCount: number;
  businessesLastUpdated: number;
  landLastUpdated: number;
};

const DashBoard = ({ jwtToken: initialJwtToken }: DashBoardProps) => {
  const IS_LIGHT_MODE = true;
  const { data: sessionData } = useSession();
  const [isUpdateButtonDisabled, setUpdateButtonDisabled] = useState(false);
  const [jwtToken, setJwtToken] = useState(initialJwtToken);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { adminRoute } = useDashboard();
  const [loadingToken, setLoadingToken] = useState(true);
  const [isEditingRoles, setIsEditingRoles] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRolesByUserId, setSelectedRolesByUserId] = useState<
    Record<string, OptionType[]>
  >({});
  const [downloadCSV, setDownloadCSV] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "_id",
    direction: "asc",
  });
  const [isEditingExpireDate, setIsEditingExpireDate] = useState(false);
  const [editingExpireDateUserId, setEditingExpireDateUserId] = useState<
    string | null
  >(null);
  const [selectedExpireDateByUserId, setSelectedExpireDateByUserId] = useState<
    Record<string, string>
  >({});
  const {
    useListUsersQuery,
    useDeleteUserMutation,
    useSuspendUserMutation,
    useSetUserRolesMutation,
    useResetUserPasswordMutation,
    useDownloadUsersCSVQuery,
    useGetStatsQuery,
    useUpdateUserExpireDateMutation,
  } = useAdminApiClient(jwtToken);
  const toggleExpireDateEditing = (userId: string) => {
    setIsEditingExpireDate(!isEditingExpireDate);
    setEditingExpireDateUserId(userId);
  };

  const handleExpireDateChange = (userId: string, date: any) => {
    if (date[0]) {
      const utcDate = new Date(
        date[0].getTime() - date[0].getTimezoneOffset() * 60000
      );
      setSelectedExpireDateByUserId(prevState => ({
        ...prevState,
        [userId]: utcDate.toISOString().split("T")[0],
      }));
    }
  };

  useEffect(() => {
    if (!initialJwtToken && sessionData) {
      setJwtToken(sessionData.token);
    }
    if (initialJwtToken || sessionData) {
      setLoadingToken(false);
    }
  }, [initialJwtToken, sessionData]);
  const filters = search
    ? {
        "or:email": `regex:${search.trim()}`,
        "or:firstName": `regex:${search.trim()}`,
        "or:lastName": `regex:${search.trim()}`,
      }
    : {};

  const { data: stats } = useGetStatsQuery("");

  const {
    data: users,
    error,
    isLoading,
    isFetching,
    refetch: refetchUsers,
  } = useListUsersQuery({
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    filters,
  });
  const [deleteUser] = useDeleteUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [setUserRoles, { isSuccess: setUserRolesSuccess }] =
    useSetUserRolesMutation();
  const [updateExpireDate, { isSuccess: updateExpireDateSuccess }] =
    useUpdateUserExpireDateMutation();

  const handleSaveExpireDate = async (userId: string) => {
    try {
      const selectedDate = selectedExpireDateByUserId[userId];

      if (selectedDate) {
        const formattedDate = selectedDate.split("T")[0];

        await updateExpireDate({
          id: userId,
          expiryDate: formattedDate,
        }).unwrap();

        refetchUsers();
      } else {
        console.error("No expiration date selected");
      }
      toggleExpireDateEditing(userId);
    } catch (error) {
      console.error("Error updating expiration date:", error);
    }
  };
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      refetchUsers();
    } catch (error) {
      console.error(`error: ${error}`);
    }
  };

  const { data: csvData, refetch } = useDownloadUsersCSVQuery(undefined, {
    skip: !downloadCSV, // Skip the initial query, we'll use refetch on click
  });
  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }

  const handleDownload = () => {
    setDownloadCSV(true);
  };

  // Once the data is available, trigger the download
  useEffect(() => {
    if (csvData) {
      const blob = new Blob([csvData], { type: "text/csv" });
      downloadBlob(blob, "users.csv");
      setDownloadCSV(false);
    }
  }, [csvData]);
  const handleSuspendUser = async (id: string) => {
    try {
      await suspendUser(id);
      refetchUsers();
    } catch (error) {
      console.error(`error: ${error}`);
    }
  };

  const toggleRoleEditing = (userId: string) => {
    setIsEditingRoles(!isEditingRoles);
    setEditingUserId(userId);
  };
  const handleRoleChange = (
    userId: string,
    selectedOptions: OnChangeValue<OptionType, true>
  ) => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setUpdateButtonDisabled(true);
    }
    setUpdateButtonDisabled(false);
    setSelectedRolesByUserId(prevState => ({
      ...prevState,
      [userId]: selectedOptions as OptionType[],
    }));
  };
  const handleUpdateUserRoles = async (userId: string) => {
    try {
      const selectedRoles =
        selectedRolesByUserId[userId]?.map(option => option.value) || [];

      if (!selectedRoles || selectedRoles.length === 0) {
        setUpdateButtonDisabled(true);
        return;
      }

      const currentUser = users?.results.find(
        (user: IUser) => user._id === userId
      );
      const hasExempt = selectedRoles.includes("exempt");
      const hadExempt = currentUser?.roles.includes("exempt");
      const isSuspended = currentUser?.status === "suspended";
      if (hasExempt && !hadExempt) {
        if (!currentUser?.expiryDate) {
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 180);
          await updateExpireDate({
            id: userId,
            expiryDate: newExpiryDate.toISOString().split("T")[0],
          });
        }
      } else if (!hasExempt && hadExempt) {
        await updateExpireDate({ id: userId, expiryDate: null });
      }

      if (isSuspended) {
        await suspendUser(userId);
      }

      setUpdateButtonDisabled(false);
      await setUserRoles({ id: userId, roles: selectedRoles });
      toggleRoleEditing(userId);

      refetchUsers();
    } catch (error) {
      console.error("Error updating user roles:", error);
    }
  };

  useEffect(() => {
    if (setUserRolesSuccess) {
      refetchUsers();
    }
  }, [setUserRolesSuccess, refetchUsers]);

  //add user
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [userIdToResetPassword, setUserIdToResetPassword] = useState<
    string | null
  >(null);

  const handleAddUserModalClose = () => {
    setIsAddUserModalOpen(false);
  };
  const handleRestModelClose = () => {
    setResetPasswordModalOpen(false);
  };

  const handleAddUserModalOpen = () => {
    setIsAddUserModalOpen(!isAddUserModalOpen);
  };
  const openResetPassworfdModal = (userId: string) => {
    setResetPasswordModalOpen(true);
    setUserIdToResetPassword(userId);
  };

  const handleAddUserModalSuccess = () => {};

  //sorting and pagination

  const handlePageChange = (p: number) => {
    setPage(p);
    refetchUsers();
  };

  const handleRecordsPerPageChange = (size: number) => {
    setPageSize(size);
    setPage(1);

    refetchUsers();
  };

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
    refetchUsers();
  };
  const columns = [
    {
      accessor: "action",
      title: "Action",
      render: (user: IUser) => (
        <div className="dropdown">
          <Dropdown
            offset={[0, 5]}
            placement={"bottom-start"}
            button={
              <svg
                className="m-auto h-5 w-5 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="5"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  opacity="0.5"
                  cx="12"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="19"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            }
          >
            <ul>
              <li>
                <button onClick={() => openResetPassworfdModal(user._id)}>
                  Reset Password
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Delete
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSuspendUser(user._id)}
                >
                  Suspend
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      ),
    },
    {
      accessor: "firstName",
      title: "Name",
      sortable: true,
      render: (user: IUser) => `${user.firstName} ${user.lastName}`,
    },
    {
      accessor: "email",
      title: "Email",
      sortable: true,
      render: (user: IUser) => user.email,
    },
    {
      accessor: "roles",
      title: "Roles",
      sortable: true,
      render: (user: IUser) => (
        <>
          {isEditingRoles && editingUserId === user._id ? (
            <div>
              <Select
                placeholder="Select a role"
                options={userRoleOptions}
                value={selectedRolesByUserId[user._id]}
                onChange={selectedOptions =>
                  handleRoleChange(user._id, selectedOptions)
                }
                className="my-2"
                isMulti
                isSearchable={true}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({
                    ...base,
                    zIndex: 9999,
                  }), // Ensure dropdown menu is always on top
                  menu: provided => ({
                    ...provided,
                    backgroundColor: "#1b2e4b",
                    color: "#808080",
                  }),
                }}
              />
              <Tippy content="Update" className=" text-white">
                <button
                  type="button"
                  disabled={isUpdateButtonDisabled}
                  onClick={() => handleUpdateUserRoles(user._id)}
                  className="px-2"
                >
                  <svg
                    className={`h-6 w-6 ${
                      isUpdateButtonDisabled
                        ? " text-gray-500"
                        : "text-success "
                    }`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="M8.5 12.5L10.5 14.5L15.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Tippy>
              <Tippy content="Cancel" className="text-white">
                <button
                  type="button"
                  onClick={() => toggleRoleEditing(user._id)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-danger"
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
                      d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </Tippy>
            </div>
          ) : user.roles && user.roles.length > 0 ? (
            <div>
              {user.roles && user.roles.some(role => role !== "")
                ? user.roles.join(", ")
                : "role-less"}
              <Tippy content="Edit" className="text-white">
                <button
                  type="button"
                  className=" ml-1 w-10 "
                  onClick={() => toggleRoleEditing(user._id)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-1 h-4 w-4 text-success ltr:mr-2 rtl:ml-2"
                  >
                    <path
                      d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      opacity="0.5"
                      d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </Tippy>
            </div>
          ) : (
            <div>
              Missing
              <Tippy content="Edit" className="text-white">
                <button
                  type="button"
                  className=" ml-1 w-10 "
                  onClick={() => toggleRoleEditing(user._id)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-1 h-4 w-4 text-success ltr:mr-2 rtl:ml-2"
                  >
                    <path
                      d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      opacity="0.5"
                      d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </Tippy>
            </div>
          )}
        </>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      sortable: true,
      render: (user: IUser) => (
        <span
          className={`badge whitespace-nowrap ${
            user.status === "active" ? "bg-primary" : "bg-danger"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      accessor: "lastLoginDate",
      title: "Last Login Date",
      sortable: true,
      render: (user: IUser) =>
        user.lastLoginDate
          ? new Date(user.lastLoginDate).toLocaleString()
          : "-",
    },
    {
      accessor: "totaltokensused",
      title: "Cost",
      sortable: true,
      render: (user: IUser) => (
        <>
          <div className="text-right" key={user._id}>
            {user?.rateLimit?.totalTokensUsed
              ? `${new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format((+user.rateLimit.totalTokensUsed / 1000) * 0.02)}`
              : "-"}
          </div>
        </>
      ),
    },
    {
      accessor: "totaltokensusedRatio",
      title: "Ratio",
      sortable: false,

      render: (user: IUser) => (
        <div className="text-right" key={user._id}>
          {user?.rateLimit?.totalTokensUsed && user?.roles
            ? (() => {
                const tokensUsed = +user.rateLimit?.totalTokensUsed;
                const costIncurred = (tokensUsed / 1000) * 0.02;

                let monthlyFee;
                if (user.roles.includes("user")) {
                  monthlyFee = 69;
                } else if (user.roles.includes("lite")) {
                  monthlyFee = 9;
                } else if (user.roles.includes("admin")) {
                  return "-";
                } else {
                  return "∞";
                }

                if (!user.createdAt) return "-";

                const creation = new Date(user.createdAt);
                const now = new Date();
                let monthsSubscribed =
                  (now.getFullYear() - creation.getFullYear()) * 12 +
                  now.getMonth() -
                  creation.getMonth() +
                  1;

                const totalSubscriptionFee = monthlyFee * monthsSubscribed;

                const ratio = costIncurred / totalSubscriptionFee;
                return ratio.toFixed(2);
              })()
            : "-"}
        </div>
      ),
    },
    {
      accessor: "expiryDate",
      title: "Expire At",
      sortable: true,
      render: (user: IUser) => (
        <>
          {isEditingExpireDate && editingExpireDateUserId === user._id ? (
            <div>
              <Flatpickr
                value={
                  selectedExpireDateByUserId[user._id] ||
                  new Date().toISOString().split("T")[0]
                }
                options={{
                  dateFormat: "Y-m-d",
                  position: "auto right",
                }}
                className="form-input"
                onChange={date => handleExpireDateChange(user._id, date)}
              />
              <Tippy content="Update" className=" text-white">
                <button
                  type="button"
                  disabled={isUpdateButtonDisabled}
                  onClick={() => handleSaveExpireDate(user._id)}
                  className="px-2"
                >
                  <svg
                    className={`h-6 w-6 ${
                      isUpdateButtonDisabled
                        ? " text-gray-500"
                        : "text-success "
                    }`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                      d="M8.5 12.5L10.5 14.5L15.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Tippy>
              <Tippy content="Cancel" className="text-white">
                <button
                  type="button"
                  onClick={() => toggleExpireDateEditing(user._id)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-danger"
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
                      d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </Tippy>
            </div>
          ) : (
            <div>
              {user.expiryDate
                ? new Date(user.expiryDate).toLocaleString()
                : "-"}
              <Tippy content="Edit" className="text-white">
                <button
                  type="button"
                  className=" ml-1 w-10 "
                  onClick={() => toggleExpireDateEditing(user._id)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-1 h-4 w-4 text-success ltr:mr-2 rtl:ml-2"
                  >
                    <path
                      d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      opacity="0.5"
                      d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </Tippy>
            </div>
          )}
        </>
      ),
    },

    // {
    //   accessor: "rateLimit",
    //   title: "Rate Limit",
    //   sortable: true,
    //   render: (user: IUser) => (
    //     <>
    //       {user.roles?.includes("buyerfree") && user?.rateLimit ? (
    //         <div>
    //           {`${user.rateLimit.currentUsage} requests used`}
    //           <Tippy
    //             content={
    //               <div className="rounded-lg bg-gray-100 p-4 text-gray-700">
    //                 <div className="mb-2 text-lg font-semibold">
    //                   Rate Limit Details
    //                 </div>
    //                 <div className="mb-1 text-sm">
    //                   <span className=" font-semibold">Current Usage:</span>{" "}
    //                   {user.rateLimit.currentUsage}
    //                 </div>
    //                 <div className="mb-1 text-sm">
    //                   <span className=" font-semibold">Remaining Usage:</span>{" "}
    //                   {user.rateLimit.remaining}
    //                 </div>
    //                 {user.rateLimit.lastUsageDate && (
    //                   <div className="mb-1 text-sm">
    //                     <span className="font-semibold">Last Usage Date:</span>{" "}
    //                     {new Date(
    //                       user.rateLimit.lastUsageDate,
    //                     ).toLocaleString()}
    //                   </div>
    //                 )}
    //                 {user.rateLimit.exceededCount > 0 && (
    //                   <>
    //                     <div className="mb-1 text-sm text-red-500">
    //                       <span className="font-semibold">Exceeded Count:</span>{" "}
    //                       {user.rateLimit.exceededCount}
    //                     </div>
    //                     {user.rateLimit.lastExceeded && (
    //                       <div className="text-sm">
    //                         <span className="font-semibold">
    //                           Last Exceeded Data:
    //                         </span>{" "}
    //                         {new Date(
    //                           user.rateLimit.lastExceeded,
    //                         ).toLocaleString()}
    //                       </div>
    //                     )}
    //                   </>
    //                 )}
    //                 {user.rateLimit.totalTokensUsed && (
    //                   <div className="mb-1 text-sm">
    //                     <span className="font-semibold">
    //                       Total Tokens Used:
    //                     </span>{" "}
    //                     {user.rateLimit.totalTokensUsed}
    //                   </div>
    //                 )}

    //                 {user.rateLimit.lastTimeTotalTokensUsage && (
    //                   <div className="mb-1 text-sm">
    //                     <span className="font-semibold">
    //                       Tokens Used Update Time:
    //                     </span>{" "}
    //                     {new Date(
    //                       user.rateLimit.lastTimeTotalTokensUsage,
    //                     ).toLocaleString()}
    //                   </div>
    //                 )}
    //               </div>
    //             }
    //             className=" !bg-transparent text-white"
    //           >
    //             <button type="button" className="ml-1 w-10">
    //               <svg
    //                 width="24"
    //                 height="24"
    //                 viewBox="0 0 24 24"
    //                 fill="none"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 className="mt-1 h-4 w-4 text-info ltr:mr-2 rtl:ml-2"
    //               >
    //                 <path
    //                   d="M12 3C6.48 3 2 7.48 2 13C2 18.52 6.48 23 12 23C17.52 23 22 18.52 22 13C22 7.48 17.52 3 12 3ZM12 21C7.59 21 4 17.41 4 13C4 8.59 7.59 5 12 5C16.41 5 20 8.59 20 13C20 17.41 16.41 21 12 21ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
    //                   fill="currentColor"
    //                 />
    //               </svg>
    //             </button>
    //           </Tippy>
    //         </div>
    //       ) : (
    //         <div>-</div>
    //       )}
    //     </>
    //   ),
    // },

    // Uncomment this if you want to include IP address
    // {
    //   accessor: 'lastLoginIP',
    //   title: 'Last Login IP Address',
    //   render: (user: IUser) => user.lastLoginIpAddress || 'N/A',
    // },
  ];

  const handleAdminRoute = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    router.push(`/apps/admin/${value}`);
  };

  const loadingSpinner = (
    <div className="relative w-full h-[500px] flex justify-center items-center">
      <svg
        aria-hidden="true"
        role="status"
        className="mr-3 inline h-4 w-4 animate-spin"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
  if (isLoading) {
    return <>{loadingSpinner}</>;
  }

  if (error) {
    return <div>Error occurred while fetching data</div>;
  }

  return (
    <>
      <Head>
        <title>Admin Panel</title>
        {IS_LIGHT_MODE && (
          <style>
            {`
            body {
              background-color: white !important;
            }
          `}
          </style>
        )}
      </Head>
      <div>
        <h2 className="text-2xl font-bold text-black mb-5 px-0">Admin Panel</h2>
        <div className="bg-dark py-2 px-2 rounded inline-block text-white">
          <select
            name="admin-routes"
            className="bg-transparent cursor-pointer border-none outline-none"
            onChange={handleAdminRoute}
          >
            {adminRoutes.map(r => (
              <option
                key={r.slug}
                value={r.slug}
                selected={r.slug === adminRoute.slug}
                className="text-dark"
              >
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="custom-select space-y-8 overflow-auto pt-5">
        {adminRoute.context === "users" && (
          <>
            <div className="flex items-center justify-center">
              {stats?.businessesVectorCount && (
                <StatsCard
                  count={stats.businessesVectorCount}
                  type="business"
                  date={stats.businessesLastUpdated}
                />
              )}
              {stats?.landVectorCount && (
                <StatsCard
                  count={stats.landVectorCount}
                  type="land"
                  date={stats.landLastUpdated}
                />
              )}
            </div>
            <div className="mb-3 flex justify-end">
              <button
                onClick={handleAddUserModalOpen}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                Add User
              </button>
            </div>
            <AddUserModal
              isOpen={isAddUserModalOpen}
              onRequestClose={handleAddUserModalClose}
              onUserAdded={refetchUsers}
              jwtToken={jwtToken}
            />
            <ResetUserPasswordModal
              isOpen={resetPasswordModalOpen}
              onRequestClose={handleRestModelClose}
              onPasswordReset={refetchUsers}
              userId={userIdToResetPassword ? userIdToResetPassword : ""}
              jwtToken={jwtToken}
            />
            <div className="panel">
              <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex flex-wrap items-center">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn btn-primary btn-sm m-1 "
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ltr:mr-2 rtl:ml-2"
                    >
                      <path
                        d="M15.3929 4.05365L14.8912 4.61112L15.3929 4.05365ZM19.3517 7.61654L18.85 8.17402L19.3517 7.61654ZM21.654 10.1541L20.9689 10.4592V10.4592L21.654 10.1541ZM3.17157 20.8284L3.7019 20.2981H3.7019L3.17157 20.8284ZM20.8284 20.8284L20.2981 20.2981L20.2981 20.2981L20.8284 20.8284ZM14 21.25H10V22.75H14V21.25ZM2.75 14V10H1.25V14H2.75ZM21.25 13.5629V14H22.75V13.5629H21.25ZM14.8912 4.61112L18.85 8.17402L19.8534 7.05907L15.8947 3.49618L14.8912 4.61112ZM22.75 13.5629C22.75 11.8745 22.7651 10.8055 22.3391 9.84897L20.9689 10.4592C21.2349 11.0565 21.25 11.742 21.25 13.5629H22.75ZM18.85 8.17402C20.2034 9.3921 20.7029 9.86199 20.9689 10.4592L22.3391 9.84897C21.9131 8.89241 21.1084 8.18853 19.8534 7.05907L18.85 8.17402ZM10.0298 2.75C11.6116 2.75 12.2085 2.76158 12.7405 2.96573L13.2779 1.5653C12.4261 1.23842 11.498 1.25 10.0298 1.25V2.75ZM15.8947 3.49618C14.8087 2.51878 14.1297 1.89214 13.2779 1.5653L12.7405 2.96573C13.2727 3.16993 13.7215 3.55836 14.8912 4.61112L15.8947 3.49618ZM10 21.25C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981L2.64124 21.3588C3.38961 22.1071 4.33855 22.4392 5.51098 22.5969C6.66182 22.7516 8.13558 22.75 10 22.75V21.25ZM1.25 14C1.25 15.8644 1.24841 17.3382 1.40313 18.489C1.56076 19.6614 1.89288 20.6104 2.64124 21.3588L3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14H1.25ZM14 22.75C15.8644 22.75 17.3382 22.7516 18.489 22.5969C19.6614 22.4392 20.6104 22.1071 21.3588 21.3588L20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25V22.75ZM21.25 14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981L21.3588 21.3588C22.1071 20.6104 22.4392 19.6614 22.5969 18.489C22.7516 17.3382 22.75 15.8644 22.75 14H21.25ZM2.75 10C2.75 8.09318 2.75159 6.73851 2.88976 5.71085C3.02502 4.70476 3.27869 4.12511 3.7019 3.7019L2.64124 2.64124C1.89288 3.38961 1.56076 4.33855 1.40313 5.51098C1.24841 6.66182 1.25 8.13558 1.25 10H2.75ZM10.0298 1.25C8.15538 1.25 6.67442 1.24842 5.51887 1.40307C4.34232 1.56054 3.39019 1.8923 2.64124 2.64124L3.7019 3.7019C4.12453 3.27928 4.70596 3.02525 5.71785 2.88982C6.75075 2.75158 8.11311 2.75 10.0298 2.75V1.25Z"
                        fill="currentColor"
                      />
                      <path
                        opacity="0.5"
                        d="M13 2.5V5C13 7.35702 13 8.53553 13.7322 9.26777C14.4645 10 15.643 10 18 10H22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                    Download CSV
                  </button>
                </div>
                <div className=" w-full ltr:ml-auto rtl:mr-auto md:w-1/4">
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="Search by first name, last name, or email"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="datatables">
                {isLoading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p>Error: </p>
                ) : (
                  <>
                    <div className="table-responsive mb-5">
                      <DataTable
                        highlightOnHover
                        fetching={isFetching}
                        records={users?.results || []}
                        columns={columns}
                        totalRecords={users?.totalData || 0}
                        recordsPerPage={pageSize}
                        page={page}
                        minHeight={200}
                        loaderVariant="dots"
                        loaderSize="md"
                        loaderColor="#1b2e4b"
                        loaderBackgroundBlur={0}
                        scrollAreaProps={{ type: "always" }}
                        onPageChange={handlePageChange}
                        recordsPerPageOptions={[5, 10, 20, 50]}
                        onRecordsPerPageChange={handleRecordsPerPageChange}
                        sortStatus={sortStatus}
                        onSortStatusChange={handleSortStatusChange}
                        idAccessor="_id"
                        paginationText={({ from, to, totalRecords }: any) =>
                          `Showing  ${from} to ${to} of ${totalRecords} entries`
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {adminRoute.chartUrl && (
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-[500px]">
              {loadingSpinner}
            </div>

            <div className="relative flex items-center justify-center text-black">
              <iframe
                style={{
                  border: "none",
                  width: "100vw",
                  height: "100vh",
                }}
                src={adminRoute.chartUrl}
              />
            </div>
          </div>
        )}
        {adminRoute.context === "showAll" && (
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-[500px]">
              {loadingSpinner}
            </div>

            {adminRoutes.map(ar => (
              <>
                {ar.chartUrl && (
                  <div>
                    <h4 className="text-xl font-bold text-black mb-5 px-0">
                      {ar.name}
                    </h4>

                    <div className="relative flex items-center justify-center text-black">
                      <iframe
                        style={{
                          border: "none",
                          width: "100vw",
                          height: "100vh",
                        }}
                        src={ar.chartUrl}
                      />
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);

  const jwtToken = session?.token || "";
  return { props: { jwtToken } };
};

export default withAuth(DashBoard, ADMIN_ROLES);
