import clsx from "clsx";
import { showErrorToast } from "@/utils/toast";

interface IProps {
  fieldName: string;
  fieldLabel?: string;
  setFieldValue: (name: string, value?: File | null) => void;
  imageSrc?: string;
  imageFile?: File | null;
  error?: string;
  maxSize?: number; // In MB
  accept?: string;
}

export const ImageInput = ({
  accept = "image/*",
  setFieldValue,
  imageSrc,
  imageFile,
  fieldName,
  fieldLabel,
  error,
  maxSize,
}: IProps) => {
  const onChangeFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (file) {
      if (maxSize) {
        const fileSizeInMB = file.size / (1024 * 1024);
        if (maxSize < fileSizeInMB) {
          showErrorToast(
            `File size exceeds the maximum allowed size of ${maxSize} MB.`
          );
          return;
        }
      }
      setFieldValue(fieldName, file);
    }
  };

  return (
    <>
      {fieldLabel ? (
        <label htmlFor={fieldName} className="text-white">
          {fieldLabel}
        </label>
      ) : null}

      {!!(imageFile || imageSrc) && (
        <div className="mb-4">
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : imageSrc}
            alt="logo"
            width={96}
          />
        </div>
      )}

      <div className={clsx("flex w-full items-center gap-2")}>
        <input
          name={fieldName}
          id={fieldName}
          type="file"
          onChange={onChangeFile}
          value={""}
          multiple={false}
          className="hidden"
          accept={accept}
        />

        {!imageFile ? (
          <label
            htmlFor={fieldName}
            className="m-0 cursor-pointer flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add Logo"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4"></path>
            </svg>
          </label>
        ) : (
          <button
            type="button"
            onClick={() => setFieldValue(fieldName, null)}
            className="m-0 flex items-center justify-center rounded-full bg-red-500 p-2 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Remove Logo"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>

      {error ? <div className="mt-1 text-danger">{error}</div> : null}
    </>
  );
};
