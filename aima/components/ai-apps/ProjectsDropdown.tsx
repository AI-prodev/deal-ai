import React, { useState, useEffect } from "react";
import { Menu } from "@headlessui/react";

import {
  useListAllAppsProjectsQuery,
  useCreateAppsProjectMutation,
  useDeleteAppsProjectMutation,
  useUpdateAppsProjectMutation,
  useGetSpecifcAppsPojectAppNameQuery,
  useLoadDefaultAppsProjectQuery,
} from "@/store/features/appsProjectApi";
import { Input } from "@mantine/core";
import { DefaultProjectData } from "@/interfaces/IAppProject";

const EditIcon = ({ className }: any) => (
  <svg
    className={`h-5 w-5 fill-current text-yellow-600 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C12.4142 1.25 12.75 1.58579 12.75 2C12.75 2.41421 12.4142 2.75 12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 11.5858 21.5858 11.25 22 11.25C22.4142 11.25 22.75 11.5858 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12ZM16.7705 2.27591C18.1384 0.908028 20.3562 0.908028 21.7241 2.27591C23.092 3.6438 23.092 5.86158 21.7241 7.22947L15.076 13.8776C14.7047 14.2489 14.4721 14.4815 14.2126 14.684C13.9069 14.9224 13.5761 15.1268 13.2261 15.2936C12.929 15.4352 12.6169 15.5392 12.1188 15.7052L9.21426 16.6734C8.67801 16.8521 8.0868 16.7126 7.68711 16.3129C7.28742 15.9132 7.14785 15.322 7.3266 14.7857L8.29477 11.8812C8.46079 11.3831 8.56479 11.071 8.7064 10.7739C8.87319 10.4239 9.07761 10.0931 9.31605 9.78742C9.51849 9.52787 9.7511 9.29529 10.1224 8.924L16.7705 2.27591ZM20.6634 3.33657C19.8813 2.55448 18.6133 2.55448 17.8312 3.33657L17.4546 3.7132C17.4773 3.80906 17.509 3.92327 17.5532 4.05066C17.6965 4.46372 17.9677 5.00771 18.48 5.51999C18.9923 6.03227 19.5363 6.30346 19.9493 6.44677C20.0767 6.49097 20.1909 6.52273 20.2868 6.54543L20.6634 6.16881C21.4455 5.38671 21.4455 4.11867 20.6634 3.33657ZM19.1051 7.72709C18.5892 7.50519 17.9882 7.14946 17.4193 6.58065C16.8505 6.01185 16.4948 5.41082 16.2729 4.89486L11.2175 9.95026C10.801 10.3668 10.6376 10.532 10.4988 10.7099C10.3274 10.9297 10.1804 11.1676 10.0605 11.4192C9.96337 11.623 9.88868 11.8429 9.7024 12.4017L9.27051 13.6974L10.3026 14.7295L11.5983 14.2976C12.1571 14.1113 12.377 14.0366 12.5808 13.9395C12.8324 13.8196 13.0703 13.6726 13.2901 13.5012C13.468 13.3624 13.6332 13.199 14.0497 12.7825L19.1051 7.72709Z"
    />
  </svg>
);

const DeleteIcon = ({ className }: any) => (
  <svg
    className={`h-5 w-5 fill-current text-red-400 ${className}`}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.0924 1.25H8.90788C7.33861 1.24998 6.08032 1.24996 5.10577 1.38767C4.09802 1.53007 3.25979 1.83575 2.64218 2.55292C2.02457 3.27008 1.84661 4.14438 1.85528 5.1621C1.86366 6.1463 2.05033 7.39066 2.28314 8.94256L3.49937 17.0508C3.67587 18.2275 3.81878 19.1804 4.02849 19.9262C4.24683 20.7027 4.56045 21.3453 5.13662 21.8415C5.71279 22.3377 6.39485 22.5525 7.19513 22.6533C7.96377 22.75 8.92732 22.75 10.1173 22.75H13.883C15.073 22.75 16.0365 22.75 16.8052 22.6533C17.6054 22.5525 18.2875 22.3377 18.8637 21.8415C19.4398 21.3453 19.7535 20.7027 19.9718 19.9262C20.1815 19.1805 20.3244 18.2276 20.5009 17.0509L21.7172 8.94253C21.95 7.39065 22.1366 6.14629 22.145 5.1621C22.1537 4.14438 21.9757 3.27008 21.3581 2.55292C20.7405 1.83575 19.9023 1.53007 18.8945 1.38767C17.92 1.24996 16.6617 1.24998 15.0924 1.25ZM3.77879 3.53175C4.05882 3.20658 4.47927 2.9911 5.31565 2.87292C6.17295 2.75177 7.32479 2.75 8.96727 2.75H15.033C16.6755 2.75 17.8273 2.75177 18.6846 2.87292C19.521 2.9911 19.9415 3.20658 20.2215 3.53175C20.5015 3.85692 20.6523 4.30468 20.6451 5.14933C20.6448 5.18248 20.6443 5.21604 20.6435 5.25H20.5005C20.5003 5.25 20.5007 5.25 20.5005 5.25H7.00045C7.00025 5.25 7.00065 5.25 7.00045 5.25H3.35678C3.35603 5.21603 3.35551 5.18248 3.35522 5.14933C3.34803 4.30468 3.49876 3.85692 3.77879 3.53175ZM5.18949 6.75H3.48546C3.53687 7.15852 3.60161 7.61096 3.67631 8.1155L3.75015 8.18934L5.18949 6.75ZM4.05013 10.6106L4.6686 14.7338L6.37599 12.9365L4.05013 10.6106ZM5.15659 17.9593C5.17275 18.0594 5.18872 18.1563 5.20463 18.25H5.39887L5.15659 17.9593ZM6.99527 19.75C6.99879 19.75 7.00232 19.75 7.00584 19.75H13.9972C13.9991 19.75 14.0009 19.75 14.0027 19.75H18.4577C18.299 20.2287 18.1176 20.5044 17.8848 20.7049C17.6171 20.9355 17.261 21.0841 16.6178 21.165C15.9538 21.2486 15.0849 21.25 13.833 21.25H10.1673C8.91538 21.25 8.04651 21.2486 7.38247 21.165C6.73934 21.0841 6.38321 20.9355 6.11546 20.7049C5.88266 20.5044 5.70127 20.2287 5.54256 19.75H6.99527ZM15.7131 18.25H18.1895L16.9018 16.9623L15.7131 18.25ZM19.0007 16.9399C19.0087 16.8869 19.0168 16.8332 19.0249 16.7788L19.404 14.2515L17.92 15.8592L19.0007 16.9399ZM19.856 11.2381L20.2249 8.77879C20.3197 8.14673 20.4033 7.5881 20.4704 7.09045L18.16 9.40079L19.856 11.2381ZM18.6895 6.75H15.7131L17.1418 8.2977L18.6895 6.75ZM12.2532 6.75H8.81081L10.5761 8.51531L12.2532 6.75ZM11.6895 18.25H9.31081L10.5002 17.0607L11.6895 18.25ZM7.40946 11.8486L4.81081 9.25L7.00015 7.06066L9.54266 9.60317L7.40946 11.8486ZM8.47047 12.9097L10.6037 10.6642L12.6895 12.75L10.5002 14.9393L8.47047 12.9097ZM11.5608 16L13.7502 13.8107L15.8403 15.9008L13.7385 18.1777L11.5608 16ZM14.8108 12.75L16.8585 14.7977L18.9795 12.5L17.0985 10.4623L14.8108 12.75ZM13.7502 11.6893L16.0803 9.35921L13.9923 7.09721L11.6371 9.57632L13.7502 11.6893ZM7.437 13.9975L9.43949 16L7.27782 18.1617L5.50363 16.0326L7.437 13.9975Z"
    />
  </svg>
);

const AddIcon = () => (
  <svg
    className="h-6 w-6 fill-current text-success"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75C17.1086 2.75 21.25 6.89137 21.25 12C21.25 17.1086 17.1086 21.25 12 21.25C6.89137 21.25 2.75 17.1086 2.75 12Z"
    />
  </svg>
);
const SaveIcon = () => (
  <svg
    className={`h-5 w-5 text-white`}
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
);
const CancelIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-white"
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
);

interface ProjectDropDownProps {
  setProjectId: (projectId: string) => void;
}

const LoadingOverlay = () => (
  <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  </div>
);

const ProjectsDropdown = ({ setProjectId }: ProjectDropDownProps) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const { data: projects, refetch } = useListAllAppsProjectsQuery("");
  const [createAppsProject] = useCreateAppsProjectMutation();
  const [deleteAppsProject] = useDeleteAppsProjectMutation();
  const [updateAppsProject] = useUpdateAppsProjectMutation();

  const {
    data: defaultProjectData,
    isLoading: isDefaultProjectLoading,
    refetch: refetchDefaultProject,
  } = useLoadDefaultAppsProjectQuery("") as {
    data: DefaultProjectData;
    isLoading: boolean;
    refetch: () => void;
  };

  useEffect(() => {
    const storedSelectedProjectId = localStorage.getItem("selectedProjectId");
    if (
      (storedSelectedProjectId && storedSelectedProjectId !== null) ||
      undefined
    ) {
      setSelectedProjectId(storedSelectedProjectId);
    }

    if (defaultProjectData && !storedSelectedProjectId) {
      setSelectedProjectId(defaultProjectData._id);
      localStorage.setItem("selectedProjectId", defaultProjectData._id);
    }
  }, [defaultProjectData]);

  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem("selectedProjectId", selectedProjectId);
      setProjectId(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleEditProject = async (projectId: string) => {
    if (!editProjectName.trim()) return;
    await updateAppsProject({
      projectId: projectId,
      name: editProjectName,
    });
    setIsEditing(null);
    setEditProjectName("");
    refetch();
  };

  const handleAddProject = async () => {
    if (newProjectName) {
      await createAppsProject({
        name: newProjectName,

        applications: [],
      });
      setNewProjectName("");
      refetch();
    }
  };
  const defaultProject = projects?.find(
    (project: { _id: string; name: string }) => project.name === "default"
  );
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteAppsProject({ projectId });
      if (projectId === selectedProjectId) {
        localStorage.removeItem("selectedProjectId");

        setSelectedProjectId(defaultProject._id);
      }
      refetch();
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const selectedProjectName =
    projects?.find(
      (project: { _id: string; name: string }) =>
        project._id === selectedProjectId
    )?.name || "Select a Project";
  const { isFetching: isAppDataLoading, isLoading } =
    useGetSpecifcAppsPojectAppNameQuery(
      {
        projectId: selectedProjectId as string,

        appName: selectedProjectName,
      },
      {
        skip: !selectedProjectId || selectedProjectName === "Select a Project",
      }
    );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      e.stopPropagation();
    }
  };
  return (
    <div className="relative  md:inline-block w-full md:w-auto">
      {isAppDataLoading && isLoading && <LoadingOverlay />}
      <Menu>
        {({ open }) => (
          <>
            <Menu.Button
              className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-xl transition-all duration-300 ease-in-out border border-blue-300 hover:border-blue-400`}
            >
              <span className="mr-2">
                Project:{" "}
                {selectedProjectName === "default"
                  ? "Default"
                  : selectedProjectName || "Default"}
              </span>
              <svg
                className="w-5 h-5 transform transition-transform duration-300 ease-in-out"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: open ? "rotate(180deg)" : "rotate(0)",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </Menu.Button>
            {open && (
              <Menu.Items
                as="div"
                className="absolute z-50 mt-2 w-full md:w-80  right-0 rounded-md bg-gray-900 shadow-lg ring-1 ring-blue-500 ring-opacity-5 focus:outline-none transition-opacity duration-300 ease-in-out"
              >
                <div className="py-1">
                  {projects?.map((project: { _id: string; name: string }) => (
                    <div
                      key={project._id}
                      className="flex items-center justify-between px-4 py-2 text-sm text-white"
                    >
                      <span
                        className={`flex-1 cursor-pointer hover:text-blue-500 ${isEditing === project._id ? "hidden" : "block"} ${selectedProjectId === project._id && "text-blue-600"}`}
                        onClick={() => handleSelectProject(project._id)}
                      >
                        {project.name === "default" ? "Default" : project.name}
                      </span>
                      {isEditing === project._id ? (
                        <input
                          type="text"
                          onKeyDown={handleKeyDown}
                          value={editProjectName}
                          onChange={e => setEditProjectName(e.target.value)}
                          className="flex-1 rounded-md bg-gray-800 text-white placeholder-gray-500 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : null}
                      <div
                        className={`flex space-x-2 ${isEditing === project._id ? "hidden" : "visible"}`}
                      >
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setIsEditing(project._id);
                            setEditProjectName(project.name);
                          }}
                          disabled={project.name === "default"}
                          className={`p-1 rounded ${project.name !== "default" && "hover:bg-blue-700"} `}
                          title="Edit"
                        >
                          <EditIcon
                            className={`${project.name === "default" ? "!text-gray-500" : ""}`}
                          />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                          }}
                          disabled={project.name === "default"}
                          className={`p-1 rounded ${project.name !== "default" && "hover:bg-blue-700"} `}
                          title="Delete"
                        >
                          <DeleteIcon
                            className={`${project.name === "default" ? "!text-gray-500" : ""}`}
                          />
                        </button>
                      </div>
                      {isEditing === project._id && (
                        <div className="flex space-x-2 mx-2">
                          <button
                            onClick={() => {
                              handleEditProject(project._id);
                              setIsEditing(null);
                            }}
                            className="p-1 rounded bg-green-500 hover:bg-green-600"
                            title="Save"
                          >
                            <SaveIcon />
                          </button>
                          <button
                            onClick={() => setIsEditing(null)}
                            className="p-1 rounded bg-gray-600 hover:bg-gray-700"
                            title="Cancel"
                          >
                            <CancelIcon />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      onKeyDown={handleKeyDown}
                      placeholder="New project name"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.currentTarget.value)}
                      className="w-full rounded-md bg-gray-800 text-white placeholder-gray-500 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddProject}
                      className="mt-2 w-full flex justify-center rounded-md bg-green-500 p-2 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ease-in-out"
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    </div>
  );
};

export default ProjectsDropdown;
