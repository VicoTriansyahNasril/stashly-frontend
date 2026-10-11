import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import { AlertCircle, Trash2, X } from "lucide-react";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] grid w-[90%] max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          <div className="flex flex-col space-y-2 text-left">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight text-zinc-100">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-zinc-400 mt-2 leading-relaxed">
              {description}
            </DialogPrimitive.Description>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-2 sm:mt-0 bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className={isDestructive ? "bg-red-600/90 text-white hover:bg-red-600" : "bg-white text-black hover:bg-zinc-200"}
            >
              {isDestructive && <Trash2 className="w-4 h-4 mr-2" />}
              {confirmText}
            </Button>
          </div>
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-zinc-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-zinc-800 data-[state=open]:text-zinc-400">
            <X className="h-4 w-4 text-zinc-400" />
            <span className="sr-only">Tutup</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
}: AlertDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[100] grid w-[90%] max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          <div className="flex flex-col items-center space-y-4 text-center mt-2">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="space-y-2">
                <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight text-zinc-100">
                {title}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-sm text-zinc-400 leading-relaxed">
                {description}
                </DialogPrimitive.Description>
            </div>
          </div>
          
          <div className="flex w-full mt-6">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full bg-white text-black hover:bg-zinc-200"
            >
              Mengerti
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
