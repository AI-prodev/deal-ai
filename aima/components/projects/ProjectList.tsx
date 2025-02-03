import React from "react";
import { IProject } from "@/interfaces/IProject";
import ProjectCard from "./ProjectCard";

const ProjectList = ({ projects }: { projects: IProject[] }) => {
  return (
    <div className="mb-5 mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-[780px]">
      {projects &&
        projects.map(project => (
          <ProjectCard key={project._id} project={project} />
        ))}
    </div>
  );
};

export default ProjectList;
