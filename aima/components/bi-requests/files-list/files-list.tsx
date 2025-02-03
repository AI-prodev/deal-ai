import LoadingSpinner from "@/pages/components/loadingSpinner";
import { createFileAPI } from "@/store/features/fileApi";
import { newtonBusinessApi } from "@/store/features/newtonApi";
import Swal from "sweetalert2";

export const FilesList = ({
  fileUploadHandler,
  filesList,
  callback,
  listIndex,
  isEditing = true,
}: {
  fileUploadHandler: (
    files: { fileName: string; fileUrl: string }[],
    listIndex: number
  ) => Promise<void>;
  filesList: any;
  callback: (
    arr: {
      fileName: string;
      fileUrl: string;
    }[],
    listIndex: number
  ) => void;
  listIndex: number;
  isEditing?: boolean;
}) => {
  const api = newtonBusinessApi();
  const [sendFileToS3, { isLoading: isFileUploadLoading }] =
    createFileAPI.useSendFileToS3Mutation();
  const { useGetSignedUrlFromS3Mutation } = api;

  const [getSignedUrlRequest, { isLoading: isSignedUrlLoading }] =
    useGetSignedUrlFromS3Mutation();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      let signedUrls: any;
      try {
        signedUrls = await getSignedUrlRequest({
          fileName: encodeURI(file.name),
          fileType:
            file.type || file.name.slice(file.name.lastIndexOf(".") + 1),
        }).unwrap();
      } catch (error: any) {
        console.error(error);
        Swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 3000,
        }).fire({
          icon: "error",
          title: error["data"]["message"],
          padding: "10px 20px",
        });

        return;
      }

      try {
        await sendFileToS3({
          signedUrl: signedUrls.signedUrl,
          file,
        });
      } catch (error) {
        console.error(error);
      }

      const files = [...filesList];
      files.push({
        fileUrl: signedUrls.fileUrl,
        fileName: file.name,
      });

      await fileUploadHandler(files, listIndex);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-row space-x-6">
        <span>File list:</span>
        {isFileUploadLoading && <LoadingSpinner isLoading />}
      </div>
      {isEditing && (
        <div>
          <div className="flex w-full items-center justify-center">
            <label
              htmlFor={`dropzone-file-${listIndex}`}
              className="dark:hover:bg-bray-800 h-34 flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  aria-hidden="true"
                  className="mb-3 h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, DOC, DOCX, XLS, XLSX, CSV, JPEG, PNG
                </p>
              </div>
              <input
                id={`dropzone-file-${listIndex}`}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpeg,.jpg,.png"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      )}
      <div className="mt-4 flex w-full flex-col">
        {filesList.map(
          (
            file: {
              fileName: string;
              fileUrl: string;
              tempUrl: string;
            },
            index: number
          ) => (
            <div
              key={`${file.fileName} - ${index}`}
              className="flex flex-row items-center justify-between border-b border-slate-800 py-4"
            >
              <span
                className="cursor-pointer"
                onClick={() => window.open(file.tempUrl)}
              >
                {file.fileName}
              </span>
              {isEditing && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="drop h-8 w-8 cursor-pointer rounded border-transparent p-1 drop-shadow-sm hover:border hover:border-slate-700"
                  onClick={() => {
                    const copy = [...filesList];
                    copy.splice(index, 1);
                    callback(copy, listIndex);
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
