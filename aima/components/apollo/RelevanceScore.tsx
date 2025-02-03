import { RelevanceScoreSVG } from "./Svg/SvgData";

interface RelevanceScoreProps {
  score: number;
}

const RelevanceScore: React.FC<RelevanceScoreProps> = ({ score }) => (
  <div className="flex items-center">
    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
      <div className="grid h-9 w-9 place-content-center  rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
        <RelevanceScoreSVG />
      </div>
    </div>
    <div className="flex-1">
      <div className="mb-2 flex font-semibold text-white-dark">
        <h6>Relevance Score</h6>
        <p className="ltr:ml-auto rtl:mr-auto">{Math.round(score * 100)}%</p>
      </div>
      <div className="h-2 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
        <div
          style={{
            width: `${Math.round(score * 100)}%`,
          }}
          className="h-full w-11/12 rounded-full bg-gradient-to-r from-[#7579ff] to-[#b224ef]"
        ></div>
      </div>
    </div>
  </div>
);

export default RelevanceScore;
