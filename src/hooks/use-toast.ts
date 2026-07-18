import { toast } from "sonner";

export function useToast() {
  return {
    toast: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    dismiss: toast.dismiss,
    success: toast.success,
  };
}

export { toast };
