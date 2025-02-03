import PageGeneratorForms from "@/components/pageGenerator/Forms";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useEffect, useState } from "react";
import { PageResults } from "@/components/pageGenerator/PageResults";
import NewProjectModal from "@/components/projects/NewProjectModal";
import { createProjectApi } from "@/store/features/projectApi";
import { format } from "date-fns";
import Link from "next/link";
import ProjectCard from "@/components/projects/ProjectCard";
import { useRouter } from "next/router";
import ProjectList from "@/components/projects/ProjectList";
import { BuildingSVG } from "@/components/icons/SVGData";

type Props = {};

const Projects = (props: Props) => {
  const router = useRouter();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const projectApiClient = createProjectApi;
  const { data: projects, refetch: refetchProjects } =
    projectApiClient.useGetMyProjectsQuery({});

  const handleNewProjectModalClose = () => {
    setIsNewProjectModalOpen(false);
  };

  const handleNewProjectModalOpen = () => {
    setIsNewProjectModalOpen(true);
  };

  if (!projects) {
    return <></>;
  }

  return (
    <div className="p-3">
      <div className="my-3 flex items-center pt-2">
        <BuildingSVG />
        <h2 className="ml-3 text-2xl font-bold">Projects</h2>
      </div>
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleNewProjectModalOpen}
          className="rounded bg-primary px-4 py-2 text-white"
        >
          + New Project
        </button>
      </div>
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onRequestClose={handleNewProjectModalClose}
        onProjectCreated={refetchProjects}
      />
      <ProjectList projects={projects} />
    </div>
  );
};

export default withAuth(Projects, USER_ROLES, "ai-platform");
