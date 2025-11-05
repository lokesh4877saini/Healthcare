// utils/toast.js
import { toast } from "react-toastify";
export const showToast = {
  success: (message) =>
    toast.success(message, {
      className: "toast-success",
      bodyClassName: "toast-body",
      progressClassName: "toast-progress",
    }),

  error: (message) =>
    toast.error(message, {
      className: "toast-error",
      bodyClassName: "toast-body",
      progressClassName: "toast-progress",
    }),

  info: (message) =>
    toast.info(message, {
      className: "toast-info",
      bodyClassName: "toast-body",
      progressClassName: "toast-progress",
    }),
};