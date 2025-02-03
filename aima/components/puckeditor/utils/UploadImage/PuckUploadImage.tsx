import { FieldLabel } from "@measured/puck";
import Button from "@mui/material/Button";
import React, { ChangeEvent, FC, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { baseUrl } from "@/utils/baseUrl";
import { useRouter } from "next/router";
import Modal from "@/components/Modal";
import { isEmpty } from "lodash";
import { createFunnelApi } from "@/store/features/projectApi";

interface IPuckImageUploadProps {
  value: any;
  onChange: (value: any) => void;
  label?: string;
}

const PuckImageUpload: FC<IPuckImageUploadProps> = ({
  value,
  onChange,
  label = "",
}) => {
  const { query } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagesList, setImagesList] = useState<any[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const pageId = query?.id as string;
  const funnelId = query?.funnel as string;
  const { data: funnel } = createFunnelApi.useGetFunnelQuery(
    { funnelId },
    { skip: !funnelId }
  );

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleUploadImage = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setIsLoading(true);
    const target = event.target as HTMLInputElement;
    const files = target?.files;

    if (files && files?.length > 0) {
      const sessionToken = localStorage.getItem("sessionToken");
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${baseUrl}/pages/uploadFile`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            pageId,
          },
          body: formData,
        });

        if (!response.ok) {
          throw "Failed to upload image";
        }

        const data = await response.json();
        onChange({ ...value, url: data?.src });
        showSuccessToast({
          title: "Image uploaded successfully!",
          showCloseButton: false,
        });
      } catch (error: any) {
        console.error(error);
        showErrorToast(error?.data?.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchImages = async (
    query: string,
    total = 30
  ): Promise<string | undefined> => {
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=${total}`,
        {
          headers: {
            Authorization:
              process.env.PIXEL_API_KEY ||
              "M1rxqwwPgePhqxVSzq4IZXta7n2XIonsEav6QPiEVRjowORq0Ymqxo62",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch image");
        return;
      }

      const data: any = await response.json();

      if (!data.photos || data.photos.length === 0) {
        console.error("No photos found");
        return;
      }

      return data.photos.map((photo: any) => {
        return photo.src;
      });
    } catch (error) {
    }
  };

  const setStockImage = (stock_url: string) => {
    setIsLoading(true);
    onChange({ url: stock_url });
    setModalIsOpen(false);
  };

  const showStockImages = async () => {
    let query = "nature";
    if (funnel?.title) {
      query = funnel.title;
    }
    if (!query) return;

    const total = 80;
    const imgList: any = await fetchImages(query, total);
    setImagesList(imgList);

    if (imgList) setModalIsOpen(true);
  };

  const showAIImages = () => {
    if (funnel?.prompt?.hero) {
      setImagesList(funnel.prompt.hero);
    }
    setModalIsOpen(true);
  };

  const ImageList = (images: any) => {
    if (images && !isEmpty(images)) {
      return (
        <div className="flex flex-wrap image-list">
          {images?.images?.map((src: any, index: any) => (
            <div key={index} className="w-1/3 mb-2">
              <img
                key={index}
                src={src.tiny ? src.tiny : src.url}
                alt={`Image ${index + 1}`}
                onClick={() => setStockImage(src.medium ? src.medium : src.url)}
              />
            </div>
          ))}
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      <FieldLabel label={label} />
      {value?.url && !isLoading && (
        <Button
          component={"label"}
          role={undefined}
          variant="contained"
          color={"error"}
          tabIndex={-1}
          sx={{
            width: "100%",
            height: "40px",
            marginBottom: "10px",
          }}
          onClick={() => onChange({ ...value, url: "" })}
        >
          Remove Image
        </Button>
      )}
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        sx={{
          width: "100%",
          height: "40px",
          marginBottom: "10px",
          backgroundColor: "#90caa9",
        }}
        disabled={isLoading}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && (
          <>
            {value?.url ? "Replace Image" : "Upload Image"}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
            />
          </>
        )}
      </Button>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        sx={{
          width: "100%",
          height: "40px",
          marginBottom: "10px",
          backgroundColor: "#90cadf",
        }}
        disabled={isLoading}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && (
          <>
            Stock Image
            <input hidden type="button" onClick={showStockImages} />
          </>
        )}
      </Button>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        sx={{
          width: "100%",
          height: "40px",
          backgroundColor: "90caff",
        }}
        disabled={isLoading}
      >
        {isLoading && <LoadingSpinner />}
        {!isLoading && (
          <>
            AI generate Image
            <input hidden type="button" onClick={showAIImages} />
          </>
        )}
      </Button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        customClassName="modal"
      >
        <div className="modal-content">
          <div className="text-right">
            <span className="close text-white text-lg" onClick={closeModal}>
              &times;
            </span>
          </div>
          <div id="imageList">
            <ImageList images={imagesList} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PuckImageUpload;
