import React, { useState } from "react";
import {
  FiPlus,
  FiZap,
  FiEdit3,
  FiEye,
  FiTrash2,
  FiClock,
  FiBriefcase,
  FiX,
} from "react-icons/fi";
import { useServices } from "../../hooks/useDashboardData";
import { useDashboardProfile } from "../../hooks/useDashboardProfile";
import {
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "../../hooks/usePortfolioMutations";
import type { CreateServiceDto, UpdateServiceDto } from "@/api/profileEndpoints";
import type { ServiceDto } from "@/api/dashboardEndpoints";
import ConfirmActionModal from "./ConfirmActionModal";

interface ServiceFormData {
  title: string;
  imageUrl: string;
  pricingMode: string;
  price: number;
  duration: string;
}

interface ServiceModalProps {
  mode: "create" | "edit";
  isOpen: boolean;
  formData: ServiceFormData;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (nextData: ServiceFormData) => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  mode,
  isOpen,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onChange,
}) => {
  if (!isOpen) return null;

  const title = mode === "create" ? "Créer un service" : "Modifier le service";
  const submitLabel =
    mode === "create"
      ? isSubmitting
        ? "Création..."
        : "Créer"
      : isSubmitting
        ? "Mise à jour..."
        : "Mettre à jour";

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toDataUrl = (selectedFile: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Impossible de lire le fichier image"));
        reader.readAsDataURL(selectedFile);
      });

    try {
      const imageDataUrl = await toDataUrl(file);
      onChange({ ...formData, imageUrl: imageDataUrl });
    } catch {
      onChange({ ...formData, imageUrl: "" });
    }
  };

  return (
    <div className="dash-service-modal-overlay">
      <div className="dash-service-modal-panel w-full max-w-xl">
        <div className="dash-service-modal-header">
          <div>
            <h3 className="dash-service-modal-title">{title}</h3>
            <p className="dash-service-modal-subtitle">
              Configurez les détails de votre service pour le rendre visible sur la marketplace.
            </p>
          </div>
          <button onClick={onClose} className="dash-service-modal-close">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="dash-service-modal-form">
          <div className="dash-service-modal-field">
            <label className="dash-service-modal-label">Titre du service</label>
            <input
              type="text"
              required
              className="dash-service-modal-input"
              value={formData.title}
              onChange={(e) => onChange({ ...formData, title: e.target.value })}
              placeholder="Ex: Développement d'application web"
            />
          </div>

          <div className="dash-service-modal-field">
            <label className="dash-service-modal-label">Image du service (optionnel)</label>
            <input
              type="file"
              accept="image/*"
              className="dash-service-modal-file"
              onChange={handleImageUpload}
            />
          </div>

          <div className="dash-service-modal-grid">
            <div className="dash-service-modal-field">
              <label className="dash-service-modal-label">Mode de tarification</label>
              <select
                className="dash-service-modal-input"
                value={formData.pricingMode}
                onChange={(e) => onChange({ ...formData, pricingMode: e.target.value })}
              >
                <option value="fixed">Tarif fixe</option>
                <option value="hourly">À l'heure</option>
                <option value="package">Package</option>
              </select>
            </div>

            <div className="dash-service-modal-field">
              <label className="dash-service-modal-label">Prix (FCFA)</label>
              <input
                type="number"
                required
                min="0"
                className="dash-service-modal-input"
                value={formData.price}
                onChange={(e) => onChange({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="dash-service-modal-field">
            <label className="dash-service-modal-label">Délai de livraison</label>
            <input
              type="text"
              required
              className="dash-service-modal-input"
              value={formData.duration}
              onChange={(e) => onChange({ ...formData, duration: e.target.value })}
              placeholder="Ex: 3 jours, 1 semaine"
            />
          </div>

          <div className="dash-service-modal-footer">
            <button
              type="submit"
              disabled={isSubmitting}
              className="dash-service-modal-btn dash-service-modal-btn-primary"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="dash-service-modal-btn dash-service-modal-btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ServicesTab: React.FC = () => {
  const { data: services = [] } = useServices();
  const { profile } = useDashboardProfile();
  const freelancePlan = profile.premium ? "premium" : "gratuit";

  const getServiceActiveState = (service: ServiceDto): boolean => {
    const withIsActive = service as ServiceDto & { isActive?: boolean | string };
    if (typeof withIsActive.isActive === "boolean") return withIsActive.isActive;
    if (typeof withIsActive.isActive === "string") return withIsActive.isActive === "actif";
    const withStatus = service as ServiceDto & { status?: string };
    return withStatus.status === "actif";
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    imageUrl: "",
    pricingMode: "fixed",
    price: 0,
    duration: "",
  });

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const handleCreateClick = () => {
    setFormData({
      title: "",
      imageUrl: "",
      pricingMode: "fixed",
      price: 0,
      duration: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (service: ServiceDto) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      imageUrl: service.image || "",
      pricingMode: "fixed", // Default if not available
      price: service.price || 0,
      duration: service.deliveryTime || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (serviceId: string) => {
    setServiceToDeleteId(serviceId);
  };

  const confirmDelete = () => {
    if (!serviceToDeleteId) return;
    deleteMutation.mutate(serviceToDeleteId, {
      onSuccess: () => {
        setServiceToDeleteId(null);
      },
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateServiceDto = {
      title: formData.title,
      imageUrl: formData.imageUrl,
      pricingMode: formData.pricingMode,
      price: formData.price,
      duration: formData.duration,
    };
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const data: UpdateServiceDto = {
      title: formData.title,
      imageUrl: formData.imageUrl,
      pricingMode: formData.pricingMode,
      price: formData.price,
      duration: formData.duration,
    };
    updateMutation.mutate(
      { id: editingService.id, data },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingService(null);
        },
      }
    );
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingService(null);
  };

  return (
    <div className="dash-services-section">
      <div className="dash-section-header">
        <div>
          <h2>Mes services</h2>
          <p className="dash-section-subtitle">
            {freelancePlan === "gratuit" &&
              `${services.length}/2 services créés (plan gratuit)`}
            {freelancePlan === "premium" && "Services illimités (plan premium)"}
          </p>
        </div>
        <button
          className="dash-btn-primary"
          disabled={freelancePlan === "gratuit" && services.length >= 2}
          onClick={handleCreateClick}
        >
          <FiPlus /> Créer un service
        </button>
      </div>

      {freelancePlan === "gratuit" && services.length >= 2 && (
        <div className="dash-alert-warning">
          <FiZap />
          <span>
            Limite atteinte ! Passez au plan premium pour créer plus de services.
          </span>
          <button className="dash-btn-upgrade">Passer Premium</button>
        </div>
      )}

      <div className="dash-services-grid">
        {services.map((service) => {
          const isServiceActive = getServiceActiveState(service);
          return (
            <div key={service.id} className="dash-service-card">
              <div
                className="dash-service-image"
                style={{ backgroundImage: `url(${service.image})` }}
              >
                <span
                  className={`dash-service-status ${isServiceActive ? "actif" : "inactif"}`}
                >
                  {isServiceActive ? "Actif" : "Inactif"}
                </span>
              </div>
              <div className="dash-service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="dash-service-meta">
                  <span className="dash-service-prix">{service.price} FCFA</span>
                  {service.deliveryTime && (
                    <span className="dash-service-delai">
                      <FiClock /> {service.deliveryTime}
                    </span>
                  )}
                </div>
                <div className="dash-service-stats">
                  <span>
                    <FiEye /> 0
                  </span>
                  <span>
                    <FiBriefcase /> 0
                  </span>
                </div>
              </div>
              <div className="dash-service-actions">
                <button className="dash-icon-btn" onClick={() => handleEditClick(service)}>
                  <FiEdit3 />
                </button>
                <button className="dash-icon-btn">
                  <FiEye />
                </button>
                <button
                  className="dash-icon-btn danger"
                  onClick={() => handleDeleteClick(service.id)}
                  disabled={deleteMutation.isPending}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ServiceModal
        mode="create"
        isOpen={isCreateModalOpen}
        formData={formData}
        isSubmitting={createMutation.isPending}
        onClose={closeModals}
        onSubmit={handleCreateSubmit}
        onChange={setFormData}
      />

      <ServiceModal
        mode="edit"
        isOpen={isEditModalOpen && Boolean(editingService)}
        formData={formData}
        isSubmitting={updateMutation.isPending}
        onClose={closeModals}
        onSubmit={handleUpdateSubmit}
        onChange={setFormData}
      />

      <ConfirmActionModal
        isOpen={Boolean(serviceToDeleteId)}
        title="Supprimer ce service ?"
        message="Cette action est irréversible et retirera le service de votre profil."
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onCancel={() => setServiceToDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ServicesTab;

