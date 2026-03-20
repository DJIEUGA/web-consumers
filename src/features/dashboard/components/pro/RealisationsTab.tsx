import React, { useState } from "react";
import { toast } from "sonner";
import {
  FiPlus,
  FiLink,
  FiHeart,
  FiMessageCircle,
  FiMoreVertical,
  FiX,
  FiTrash2,
  FiEdit3,
  FiExternalLink,
} from "react-icons/fi";
import { usePosts } from "../../hooks/useDashboardData";
import {
  useCreatePortfolio,
  useDeletePortfolio,
} from "../../hooks/usePortfolioMutations";
import type { CreatePortfolioDto } from "@/api/profileEndpoints";
import ConfirmActionModal from "./ConfirmActionModal";
import { normalizeImageFileForUpload } from "@/utils/imageCompression";

interface PortfolioFormData {
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  projectLink: string;
  tools: string[];
}

const RealisationsTab: React.FC = () => {
  const { data: posts = [] } = usePosts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [portfolioToDeleteId, setPortfolioToDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PortfolioFormData>({
    title: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    projectLink: "",
    tools: [],
  });
  const [toolsInput, setToolsInput] = useState("");

  const createMutation = useCreatePortfolio();
  const deleteMutation = useDeletePortfolio();

  const handleCreateClick = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      imageFile: null,
      projectLink: "",
      tools: [],
    });
    setToolsInput("");
    setIsCreateModalOpen(true);
  };

  const handleDeleteClick = (portfolioId: string) => {
    setPortfolioToDeleteId(portfolioId);
  };

  const confirmDelete = () => {
    if (!portfolioToDeleteId) return;
    deleteMutation.mutate(portfolioToDeleteId, {
      onSuccess: () => {
        setPortfolioToDeleteId(null);
      },
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse tools from comma-separated input
    const toolsArray = toolsInput
      .split(",")
      .map((tool) => tool.trim())
      .filter((tool) => tool.length > 0);

    const data: CreatePortfolioDto = {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageFile ? "" : formData.imageUrl,
      projectLink: formData.projectLink,
      tools: toolsArray,
    };

    createMutation.mutate(
      {
        data,
        image: formData.imageFile,
      },
      {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
      }
    );
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const normalizedFile = normalizeImageFileForUpload(file);

      setFormData({
        ...formData,
        imageFile: normalizedFile,
        imageUrl: URL.createObjectURL(normalizedFile),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Format image non supporte";
      toast.error(message);
      event.target.value = "";
    }
  };

  return (
    <div className="dash-posts-section">
      <div className="dash-section-header">
        <div>
          <h2>Mes réalisations</h2>
          <p className="dash-section-subtitle">Partagez vos meilleurs projets</p>
        </div>
        <button className="dash-btn-primary" onClick={handleCreateClick}>
          <FiPlus /> Ajouter une réalisation
        </button>
      </div>

      <div className="dash-posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="dash-post-card">
            {post.type === "image" && (
              <div className="dash-post-media">
                <img src={post.medias[0]} alt={post.titre} />
              </div>
            )}
            {post.type === "link" && (
              <div className="dash-post-link">
                <FiLink />
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.url}
                </a>
              </div>
            )}
            <div className="dash-post-content">
              <h3>{post.titre}</h3>
              <p>{post.description}</p>
              <div className="dash-post-footer">
                <div className="dash-post-stats">
                  <span>
                    <FiHeart /> {post.likes}
                  </span>
                  <span>
                    <FiMessageCircle /> {post.commentaires}
                  </span>
                </div>
                <span className="dash-post-date">
                  {new Date(post.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
            <div className="absolute top-3 right-3">
              <button
                className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
                onClick={() => handleDeleteClick(post.id)}
                disabled={deleteMutation.isPending}
              >
                <FiTrash2 className="text-red-600" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Portfolio Modal */}
      {isCreateModalOpen && (
        <div className="dash-service-modal-overlay">
          <div className="dash-service-modal-panel dash-service-modal-panel--scroll w-full max-w-xl">
            <div className="dash-service-modal-header">
              <div>
                <h3 className="dash-service-modal-title">Ajouter une réalisation</h3>
                <p className="dash-service-modal-subtitle">
                  Mettez en valeur vos meilleurs projets avec un visuel clair.
                </p>
              </div>
              <button onClick={closeModal} className="dash-service-modal-close">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="dash-service-modal-form">
              <div className="dash-service-modal-field">
                <label className="dash-service-modal-label">Titre du projet</label>
                <input
                  type="text"
                  required
                  className="dash-service-modal-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Application mobile e-commerce"
                />
              </div>

              <div className="dash-service-modal-field">
                <label className="dash-service-modal-label">Description</label>
                <textarea
                  required
                  rows={4}
                  className="dash-service-modal-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre projet..."
                />
              </div>

              <div className="dash-service-modal-field">
                <label className="dash-service-modal-label">Image du projet (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="dash-service-modal-file"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="dash-service-modal-field">
                <label className="dash-service-modal-label">Lien du projet</label>
                <input
                  type="url"
                  required
                  className="dash-service-modal-input"
                  value={formData.projectLink}
                  onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                  placeholder="https://project-demo.com"
                />
              </div>

              <div className="dash-service-modal-field">
                <label className="dash-service-modal-label">Technologies utilisées</label>
                <input
                  type="text"
                  className="dash-service-modal-input"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  placeholder="React, Node.js, MongoDB (séparer par des virgules)"
                />
                <p className="dash-service-modal-hint">
                  Séparez les technologies par des virgules
                </p>
              </div>

              <div className="dash-service-modal-footer">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="dash-service-modal-btn dash-service-modal-btn-primary"
                >
                  {createMutation.isPending ? "Ajout..." : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="dash-service-modal-btn dash-service-modal-btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={Boolean(portfolioToDeleteId)}
        title="Supprimer cette réalisation ?"
        message="Cette action est irréversible et retirera le projet de votre portfolio."
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onCancel={() => setPortfolioToDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RealisationsTab;
