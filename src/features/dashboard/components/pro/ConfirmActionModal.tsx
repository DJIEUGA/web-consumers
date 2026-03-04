import React from "react";
import { FiX } from "react-icons/fi";

interface ConfirmActionModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  isPending = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dash-service-modal-overlay">
      <div className="dash-service-modal-panel w-full max-w-md">
        <div className="dash-service-modal-header">
          <div>
            <h3 className="dash-service-modal-title">{title}</h3>
            <p className="dash-service-modal-message">{message}</p>
          </div>
          <button onClick={onCancel} className="dash-service-modal-close" aria-label="Fermer">
            <FiX size={18} />
          </button>
        </div>

        <div className="dash-service-modal-actions-inline">
          <button
            type="button"
            onClick={onCancel}
            className="dash-service-modal-btn dash-service-modal-btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="dash-service-modal-btn dash-service-modal-btn-primary"
          >
            {isPending ? "Suppression..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
