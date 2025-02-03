import Swal from "sweetalert2";

export const showMessage1 = () => {
  const toast = Swal.mixin({
    toast: true,
    position: "top-start",
    showConfirmButton: false,
    timer: 3000,
  });

  toast.fire({
    icon: "success",
    title: "Connecting to API",
    padding: "10px 20px",
  });
};

export const showMessage2 = (title?: string) => {
  const toast = Swal.mixin({
    toast: true,
    position: "top-start",
    showConfirmButton: false,
    timer: 3000,
  });

  toast.fire({
    title: title ? title : "Building thesis (this may take up to 3 minutes)",
    padding: "10px 20px",
  });
};

export const showErrorToast = (message: string) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    position: "bottom-start",
    text: message,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      title: "text-danger",
    },
  });
};

export const showErrorToastResize = (message: string) => {
  Swal.fire({
    icon: "warning",
    title: "Error",
    position: "bottom-start",
    text: message,
    showConfirmButton: true,
    showCloseButton: true,
    customClass: {
      title: "text-danger",
    },
  });
};

export const retryToast = (color: string, retryCount: number) => {
  const toast = Swal.mixin({
    toast: true,
    position: "bottom-start",
    showConfirmButton: false,
    timer: 3000,
    showCloseButton: true,
    customClass: {
      popup: `color-${color} z-`,
    },
  });
  toast.fire({
    title: `API error. Retrying in 3 seconds. Retry count: ${retryCount}`,
  });
};

export type SuccessToastOptions = {
  title: string;
  timer?: number;
  showCloseButton?: boolean;
};

export const showSuccessToast = ({
  title,
  timer = 3000,
  showCloseButton = true,
}: SuccessToastOptions) => {
  const toast = Swal.mixin({
    toast: true,
    position: "bottom-start",
    showConfirmButton: false,
    timer,
    showCloseButton,
    customClass: {
      popup: `color-success`,
    },
  });

  toast.fire({
    title,
  });
};

export const showWarningToast = ({
  title,
  timer = 3000,
  showCloseButton = true,
}: SuccessToastOptions) => {
  const toast = Swal.mixin({
    toast: true,
    position: "bottom-start",
    showConfirmButton: false,
    timer,
    showCloseButton,
    customClass: {
      popup: `color-warning`,
    },
  });

  toast.fire({
    title,
  });
};

export const showErrorToastTimer = ({
  title,
  timer = 3000,
}: SuccessToastOptions) => {
  const toast = Swal.mixin({
    toast: true,
    position: "bottom-start",
    showConfirmButton: false,
    timer,
    showCloseButton: true,
    customClass: {
      popup: `color-danger`,
    },
  });

  toast.fire({
    title,
  });
};

export const showSubscriptionErrorToast = () => {
  Swal.fire({
    icon: "error",
    title: "Error",

    html: `You need a software subscription to do that. <br/> <a href='/users/user-account-settings#subscriptions' style='color: #FFD700;  text-decoration: underline;'>Manage your subscription.</a>`,
    position: "bottom-start",
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      title: "text-danger",
    },
  });
};
