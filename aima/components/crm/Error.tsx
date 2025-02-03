interface IErrorProps {
  message: string;
}

const Error = ({ message }: IErrorProps) => (
  <div className="flex items-center justify-center bg-[#ed390d] rounded px-4 w-full h-52">
    <p className="text-white">{message}</p>
  </div>
);

export default Error;
