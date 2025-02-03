import { PencilSquareSVG } from "@/components/icons/SVGData";
import { showErrorToast } from "@/utils/toast";

interface IProps {
  setFieldValue: (name: string, value?: File | null) => void;
  imageSrc?: string;
  imageFile?: File | null;
}

export const BlogPostHeroImage = ({
  imageFile,
  imageSrc,
  setFieldValue,
}: IProps) => {
  const onChangeFile = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (20 < fileSizeInMB) {
        showErrorToast(`File size exceeds the maximum allowed size of 20 MB.`);
        return;
      }
      setFieldValue("heroImage", file);
    }
  };
  return (
    <div className="relative">
      {!!(imageFile || imageSrc) && (
        <div className="mb-4">
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : imageSrc}
            alt="logo"
            className="rounded-lg w-full max-h-[580px] object-cover"
          />
        </div>
      )}
      <input
        id="heroImagePicker"
        type="file"
        onChange={onChangeFile}
        value={""}
        multiple={false}
        className="hidden"
        accept="image/jpg, image/png, image/gif"
      />
      <label
        htmlFor="heroImagePicker"
        aria-label="Change Hero Image"
        className="cursor-pointer bg-primary p-2 rounded-full absolute right-2 top-2"
      >
        <PencilSquareSVG />
      </label>
    </div>
  );
};
