import { IProject } from "@/interfaces/IProject";
import { createProjectApi } from "@/store/features/projectApi";
import { useRouter } from "next/router";
import React, { useCallback } from "react";

const ProjectSettings = ({ project }: { project: IProject }) => {
  const router = useRouter();
  const { refetch: refetchProjects } = createProjectApi.useGetMyProjectsQuery(
    {}
  );
  const [deleteProject] = createProjectApi.useDeleteProjectMutation();

  const handleDeleteProject = useCallback(async () => {
    if (!project) {
      return;
    }
    const confirmation = prompt(
      `Are you sure you want to delete ${project.title}? Doing so will also delete your funnels. Type DELETE to confirm`
    );
    if (!confirmation) {
      return;
    }
    if (confirmation !== "DELETE") {
      alert("You must type DELETE to continue.");
      return;
    }

    await deleteProject({ projectId: project._id });
    await refetchProjects();

    router.push("/projects");
  }, [project]);

  return (
    <>
      <div className="my-3 pt-2">
        <h2 className="mt-2 text-2xl font-bold">Settings</h2>
      </div>
      <div className="mt-6 flex justify-start">
        <button
          onClick={handleDeleteProject}
          className="rounded px-4 py-2 text-white bg-danger"
        >
          Delete Project
        </button>
      </div>
    </>
  );
};

export default ProjectSettings;
