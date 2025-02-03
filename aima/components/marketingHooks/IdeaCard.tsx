import React from "react";

interface IdeaCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ title, description, onClick }) => {
  return (
    <div
      className="mb-4 cursor-pointer rounded-lg border border-gray-200 p-4 shadow-sm hover:bg-gray-100"
      onClick={onClick}
    >
      <h4 className="mb-2 text-lg font-semibold">{title}</h4>
      <p className="text-gray-300 hover:text-gray-700">{description}</p>
    </div>
  );
};

export default IdeaCard;
