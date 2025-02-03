import React from "react";
import Modal from "@/components/Modal";
import { Button } from "@mantine/core";
import { useFormik } from "formik";
import { IVisitor } from "@/interfaces/ITicket";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().required().label("Email"),
});

interface UpdateUserDataModalProps {
  open: boolean;
  onClose: (values: IVisitor) => void;
}

const UpdateUserDataModal = ({ open, onClose }: UpdateUserDataModalProps) => {
  const onSubmit = async (values: IVisitor) => {
    onClose(values);
  };

  const { values, errors, handleSubmit, setFieldValue, touched, dirty } =
    useFormik<IVisitor>({
      initialValues: {
        name: "",
        email: "",
      },
      onSubmit,
      validationSchema,
    });

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => {}}
      customClassName="bg-white dark:bg-white"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold">Update your data</h1>
          <span className="text-sm">
            In order to create a ticket, Please complete the following form:
          </span>
        </div>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <div className={touched.name && errors.name ? "has-error" : ""}>
            <input
              name="name"
              placeholder="Name"
              value={values.name}
              onChange={e => setFieldValue("name", e.target.value)}
              className="w-full rounded p-2 border-2 outline-primary"
            />
            {errors.name && (
              <span className="text-danger text-xs mt-1">{errors.name}</span>
            )}
          </div>

          <div className={touched.email && errors.email ? "has-error" : ""}>
            <input
              name="email"
              placeholder="Email"
              value={values.email}
              onChange={e => setFieldValue("email", e.target.value)}
              className="w-full rounded p-2 border-2 outline-primary"
            />
            {errors.email && (
              <span className="text-danger text-xs mt-1">{errors.email}</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={!dirty || Object.values(errors).some(Boolean)}
            className="bg-primary hover:bg-primary/80 text-sm h-10"
          >
            Save
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default UpdateUserDataModal;
