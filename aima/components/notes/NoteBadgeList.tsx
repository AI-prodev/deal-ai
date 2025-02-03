import NoteBadge from "./NoteBadge";
interface Props {
  remindDatetime?: Date;
}

const BadgeList = (props: Props) => {
  return (
    <div className="badge-list flex flex-wrap gap-2 p-1">
      {props.remindDatetime && (
        <NoteBadge remindDatetime={props.remindDatetime} />
      )}
    </div>
  );
};

export default BadgeList;
