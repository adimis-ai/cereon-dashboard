import { FC, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertTriangle, Trash } from "lucide-react";
import { Input } from "./input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";

export interface Acknowledgment {
  key: string;
  title: string;
  description: string;
}

export interface DeleteScreenProps {
  /** The name/identifier of the item being deleted */
  itemName: string;
  /** Custom title for the warning alert */
  warningTitle?: string;
  /** Custom description for the warning alert. Use {itemName} as placeholder */
  warningDescription?: string;
  /** List of acknowledgments the user needs to check */
  acknowledgments?: Acknowledgment[];
  /** Custom text for the confirmation input label. Use {itemName} as placeholder */
  confirmationLabel?: string;
  /** Custom placeholder for the confirmation input */
  confirmationPlaceholder?: string;
  /** Icon component to use in the alert */
  AlertIcon?: FC<{ className?: string }>;
  /** Additional CSS classes for the container */
  className?: string;
  /** Callback fired when deletion confirmation state changes */
  onStateChange?: (state: {
    allAcknowledged: boolean;
    isConfirmTextValid: boolean;
  }) => void | Promise<void>;
  /** Callback fired when user clicks on the delete button */
  onConfirm?: (state: {
    allAcknowledged: boolean;
    isConfirmTextValid: boolean;
  }) => void | Promise<void>;
}

export const DeleteScreen: FC<DeleteScreenProps> = ({
  itemName,
  warningTitle = "Critical Action Warning",
  warningDescription = "You are about to delete {itemName}. This is a permanent action and cannot be reversed.",
  acknowledgments = [
    {
      key: "permanent",
      title: "Permanent Action",
      description: "This action is irreversible and cannot be undone.",
    },
  ],
  confirmationLabel = "Type {itemName} to confirm deletion:",
  confirmationPlaceholder,
  AlertIcon = AlertTriangle,
  className = "",
  onStateChange,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [userAcknowledgments, setUserAcknowledgments] = useState<
    Record<string, boolean>
  >(Object.fromEntries(acknowledgments.map((ack) => [ack.key, false])));

  const allAcknowledged = Object.values(userAcknowledgments).every(Boolean);
  const isConfirmTextValid = confirmText === itemName;

  useEffect(() => {
    onStateChange?.({ allAcknowledged, isConfirmTextValid });
  }, [allAcknowledged, isConfirmTextValid, onStateChange]);

  const handleAcknowledge = (key: string) => {
    setUserAcknowledgments((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const interpolateText = (text: string) =>
    text.replace("{itemName}", itemName);

  return (
    <div
      className={`space-y-6 bg-card text-card-foreground rounded-xl border p-6 shadow-sm ${className}`.trim()}
    >
      <Alert variant="destructive" className="border-2">
        <AlertIcon className="h-5 w-5" />
        <AlertTitle>{warningTitle}</AlertTitle>
        <AlertDescription>
          {interpolateText(warningDescription)}
        </AlertDescription>
      </Alert>

      {acknowledgments.length > 0 && (
        <div className="space-y-4 border-t border-b py-4 border-destructive/20">
          <h3 className="font-semibold text-destructive mb-3">
            Please acknowledge the following:
          </h3>
          <div className="space-y-3">
            {acknowledgments.map((item) => (
              <div
                key={item.key}
                className="flex items-start gap-1 space-x-3 p-3 rounded-lg border border-destructive/20 hover:bg-destructive/5 transition-colors"
              >
                <div className="shrink-0 text-destructive">
                  <AlertIcon className="size-8 mt-1.5" />
                </div>
                <div className="flex-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={userAcknowledgments[item.key]}
                      onChange={() => handleAcknowledge(item.key)}
                      className="rounded border-destructive text-destructive focus:ring-destructive"
                    />
                    <span className="font-medium">{item.title}</span>
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm text-muted-foreground block">
          {interpolateText(confirmationLabel)}
        </label>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={confirmationPlaceholder ?? `Type ${itemName} to confirm`}
          aria-label="Deletion confirmation input"
        />
        {onConfirm && (
          <Button
            label="Permanently Delete"
            size="sm"
            icon={<Trash className="size-4" />}
            variant="destructive"
            className="mt-2"
            disabled={!allAcknowledged || !isConfirmTextValid || loading}
            loading={loading}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await onConfirm({ allAcknowledged, isConfirmTextValid });
                setLoading(true);
              } finally {
                setLoading(false);
                setConfirmText("");
                setUserAcknowledgments(
                  Object.fromEntries(
                    acknowledgments.map((ack) => [ack.key, false])
                  )
                );
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export interface DeleteAlertDialogProps
  extends Omit<DeleteScreenProps, "onStateChange"> {
  /** Dialog open state */
  open?: boolean;
  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Dialog title */
  dialogTitle?: string;
  /** Whether the confirm button is loading */
  isLoading?: boolean;
  /** Callback fired when deletion is confirmed */
  onConfirm: () => void | Promise<void>;
}

export const DeleteAlertDialog: FC<DeleteAlertDialogProps> = ({
  open,
  onOpenChange,
  confirmText = "Delete",
  cancelText = "Cancel",
  dialogTitle = "Delete Confirmation",
  isLoading = false,
  onConfirm,
  ...deleteScreenProps
}) => {
  const [canDelete, setCanDelete] = useState(false);

  const handleStateChange = ({
    allAcknowledged,
    isConfirmTextValid,
  }: {
    allAcknowledged: boolean;
    isConfirmTextValid: boolean;
  }) => {
    setCanDelete(allAcknowledged && isConfirmTextValid);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="px-4 pt-4">
            {dialogTitle}
          </AlertDialogTitle>
          <DeleteScreen
            {...deleteScreenProps}
            onStateChange={handleStateChange}
          />
        </AlertDialogHeader>
        <AlertDialogFooter className="px-4 pb-4">
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canDelete || isLoading}
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
