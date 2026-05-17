import React from "react";
import { FiX } from "react-icons/fi";

interface AdminConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmStyle?: "primary" | "danger" | "success";
}

const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  pendingLabel = "Chargement...",
  isPending = false,
  confirmStyle = "primary",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-panel">
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{title}</h3>
          <button onClick={onCancel} className="admin-modal-close" aria-label="Fermer">
            <FiX size={18} />
          </button>
        </div>
        
        <div className="admin-modal-body">
          <p className="admin-modal-message">{message}</p>
        </div>

        <div className="admin-modal-footer">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="admin-btn-cancel"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`admin-btn-confirm ${confirmStyle}`}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
