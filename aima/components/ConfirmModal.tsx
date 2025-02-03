import { useState } from "react";
import Modal from "./Modal";

interface IProps {
  text: string;
  isOpen: boolean;
  close: () => void;
  confirm: () => Promise<void>;
}

export const ConfirmModal = ({ text, isOpen, close, confirm }: IProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const confirmDelete = async () => {
    setIsLoading(true);
    await confirm();
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={close}>
      <p className="text-lg font-bold dark:text-white">{text}</p>

      <div className="mt-6 flex items-center justify-end gap-4">
        <button
          disabled={isLoading}
          className="btn btn-primary"
          onClick={close}
        >
          Cancel
        </button>
        <button
          disabled={isLoading}
          className="btn btn-danger"
          onClick={confirmDelete}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};
