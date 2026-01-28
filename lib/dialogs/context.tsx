"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type DialogVariant = "default" | "destructive" | "warning";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

interface AlertOptions {
  title: string;
  description?: string;
  confirmText?: string;
  variant?: DialogVariant;
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
  isAlert: boolean;
}

interface DialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

const variantStyles: Record<DialogVariant, { button: string; icon: string }> = {
  default: {
    button: "bg-slate-900 hover:bg-slate-800 text-white",
    icon: "text-slate-600",
  },
  destructive: {
    button: "bg-red-600 hover:bg-red-700 text-white",
    icon: "text-red-600",
  },
  warning: {
    button: "bg-amber-600 hover:bg-amber-700 text-white",
    icon: "text-amber-600",
  },
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
    isAlert: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        resolve,
        isAlert: false,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        description: options.description || "",
        confirmText: options.confirmText || "OK",
        cancelText: "Cancel",
        variant: options.variant || "default",
        resolve: () => resolve(),
        isAlert: true,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  }, [state]);

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  const styles = variantStyles[state.variant || "default"];

  return (
    <DialogContext.Provider
      value={{ confirm, alert, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <AlertDialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              {state.variant === "destructive" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
              )}
              {state.variant === "warning" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <svg
                    className="h-5 w-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              )}
              {state.variant === "default" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-5 w-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              )}
              <span>{state.title}</span>
            </AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription className="ml-13 pl-[52px]">
                {state.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            {!state.isAlert && (
              <AlertDialogCancel className="mt-0">
                {state.cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={handleConfirm}
              className={styles.button}
            >
              {state.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContext.Provider>
  );
}

export function useDialogs() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogs must be used within a DialogProvider");
  }
  return context;
}
