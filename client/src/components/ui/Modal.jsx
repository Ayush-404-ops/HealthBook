import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      {isOpen && (
        <Dialog.Portal forceMount>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60" />
          <Dialog.Content asChild>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div
                className={`w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden focus:outline-none my-8`}
              >
                {(title || showClose) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      {title && (
                        <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    {showClose && (
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          onClick={onClose}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                          aria-label="Close"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </Dialog.Close>
                    )}
                  </div>
                )}
                <div className="p-6">{children}</div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
};
