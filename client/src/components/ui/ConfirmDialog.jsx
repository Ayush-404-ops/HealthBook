import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{description}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full">
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} className="w-full">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
