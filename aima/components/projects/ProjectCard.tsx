import { IProject } from "@/interfaces/IProject";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import { BuildingSVG } from "@/components/icons/SVGData";

const ProjectCard = ({ project }: { project: IProject }) => {
  return (
    <Link key={project._id} href={`projects/${project._id}`}>
      <div className="w-full max-w-[250px] rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="py-7 px-6">
          <div className="mb-5 inline-block rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
            <BuildingSVG />
          </div>
          <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
            {project.title}
          </h5>
          <p className="text-white-dark">
            Created {format(new Date(project.createdAt), "yyyy-MM-dd")}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
