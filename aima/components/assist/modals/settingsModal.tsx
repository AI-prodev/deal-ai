import Modal from "@/components/Modal";
import { useFormik } from "formik";
import { Button } from "@mantine/core";
import {
  useGetAssistSettingsQuery,
  usePatchAssistSettingsMutation,
} from "@/store/features/assistApi";
import { useEffect } from "react";
import { IAssistSettings } from "@/interfaces/ITicket";
import * as Yup from "yup";

const colors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#805dca",
  "#3f51b5",
  "#4361EE",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
];

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  url: Yup.string().required().label("URL"),
  color: Yup.string().required().label("Color"),
});

const ColorBubble = ({
  value,
  onClick,
  selected,
}: {
  value: string;
  onClick: VoidFunction;
  selected: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: value }}
      className={`w-14 h-14 rounded-full shadow-3xl flex items-center justify-center cursor-pointer`}
    >
      {selected && (
        <img src="/assets/images/checked.svg" width={24} height={24} />
      )}
    </div>
  );
};

interface SettingsModalProps {
  open: boolean;
  onClose: VoidFunction;
  assistKey: string;
}

const SettingsModal = ({ open, onClose, assistKey }: SettingsModalProps) => {
  const { data: settings } = useGetAssistSettingsQuery(
    { assistKey },
    { skip: !assistKey }
  );
  const [patchSettings] = usePatchAssistSettingsMutation();

  const onSubmit = async (values: IAssistSettings) => {
    await patchSettings(values);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    resetForm();
  };

  const {
    values,
    errors,
    handleSubmit,
    resetForm,
    setFieldValue,
    touched,
    dirty,
  } = useFormik<IAssistSettings>({
    initialValues: {
      name: "",
      url: "",
      color: "",
    },
    onSubmit,
    validationSchema,
  });

  useEffect(() => {
    if (settings) {
      resetForm({
        values: settings,
      });
    }
  }, [settings]);

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      customClassName="bg-white dark:bg-white sm:max-h-[670px]"
    >
      <h2 className={`mb-4 text-xl font-extrabold`}>Widget Settings</h2>

      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className={touched.name && errors.name ? "has-error" : ""}>
          <label htmlFor="name">Name</label>
          <input
            name="name"
            placeholder="Site Name"
            value={values.name}
            onChange={e => setFieldValue("name", e.target.value)}
            className="w-full rounded p-2 border-2 outline-primary"
          />
          {errors.name && (
            <span className="text-danger text-xs mt-1">{errors.name}</span>
          )}
        </div>
        <div className={touched.url && errors.url ? "has-error" : ""}>
          <label htmlFor="url">URL</label>
          <input
            name="url"
            placeholder="Site URL"
            value={values.url}
            onChange={e => setFieldValue("url", e.target.value)}
            className="w-full rounded p-2 border-2 outline-primary"
          />
          {errors.url && (
            <span className="text-danger text-xs mt-1">{errors.url}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="color">Color</label>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color, idx) => (
              <ColorBubble
                key={idx}
                value={color}
                onClick={() => setFieldValue("color", color)}
                selected={color.toLowerCase() === values.color.toLowerCase()}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-5">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="bg-transparent hover:bg-primary/10 text-sm h-10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!dirty || Object.values(errors).some(Boolean)}
            className="bg-primary hover:bg-primary/80 text-sm h-10"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal;
