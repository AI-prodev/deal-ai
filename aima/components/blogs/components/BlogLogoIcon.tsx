import React, { ChangeEvent, useMemo, useRef, useState } from "react";
import { showSuccessToast } from "@/utils/toast";
import { useDisclosure } from "@mantine/hooks";
import { IBlogDetail } from "@/interfaces/IBlog";
import { createBlogApi } from "@/store/features/blogApi";
import Modal from "../../Modal";

export const BlogLogoIcon = ({ blog }: { blog: IBlogDetail }) => {
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    useGetBlogQuery,
    useUpdateBlogLogoMutation,
    useDeleteBlogLogoMutation,
  } = createBlogApi;
  const [updateBlogLogo] = useUpdateBlogLogoMutation();
  const [deleteBlogLogo] = useDeleteBlogLogoMutation();
  const { refetch: refetchBlog } = useGetBlogQuery({
    blogId: blog._id,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, deleteModalHandler] = useDisclosure(false);

  const deleteFavicon = async () => {
    setIsLoading(true);
    try {
      const data = await deleteBlogLogo({ blogId: blog._id }).unwrap();

      if (data) {
        refetchBlog();
        deleteModalHandler.close();
        showSuccessToast({ title: "Logo Deleted" });
      }
    } catch (error) {
      console.error("Failed to delete Logo", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onClickSave = async () => {
    if (!logoImage) {
      inputRef.current?.click();
    } else {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", logoImage);
        const data = await updateBlogLogo({
          blogId: blog._id,
          formData,
        }).unwrap();

        if (data) {
          refetchBlog();
          showSuccessToast({ title: "Logo Updated" });
          setLogoImage(null);
        }
      } catch (error) {
        console.error("Failed to save Logo", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onClickDelete = () => {
    if (logoImage) {
      setLogoImage(null);
    } else if (blog.logoImage) {
      deleteModalHandler.open();
    }
  };

  const onChangeFile = (evt: ChangeEvent<HTMLInputElement>) => {
    setLogoImage(evt.target.files?.[0] || null);
  };

  const buttonLabel = useMemo(() => {
    if (!!logoImage && !blog.logoImage) {
      return "Save";
    }
    if (!!logoImage && blog.logoImage) {
      return "Update";
    }
    if (blog.logoImage) {
      return "Replace";
    }
    return "Add";
  }, [!!logoImage, blog.logoImage]);

  return (
    <>
      <div className="mt-4 w-full max-w-lg">
        {!!(logoImage || blog.logoImage) && (
          <div className="mb-4">
            <img
              src={logoImage ? URL.createObjectURL(logoImage) : blog.logoImage}
              alt="logo"
              width={96}
            />
          </div>
        )}

        <input
          type="file"
          onChange={onChangeFile}
          multiple={false}
          className="hidden"
          accept="image/jpg, image/png, image/gif"
          ref={inputRef}
        />

        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            disabled={isLoading}
            className="btn btn-primary"
            onClick={onClickSave}
          >
            {buttonLabel}
          </button>

          {!!blog?.logoImage || !!logoImage ? (
            <button
              type="button"
              onClick={onClickDelete}
              className={"btn btn-danger"}
              disabled={isLoading}
            >
              {logoImage ? "Cancel" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={deleteModalHandler.close}
      >
        <p className="text-lg font-bold text-white">
          Are you sure you want to remove the logo?
        </p>

        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            disabled={isLoading}
            className="btn btn-primary"
            onClick={deleteModalHandler.close}
          >
            Cancel
          </button>

          <button
            disabled={isLoading}
            className="btn btn-danger"
            onClick={deleteFavicon}
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};
