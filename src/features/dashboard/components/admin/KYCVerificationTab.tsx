import React, { useState } from "react";
import {
  FiShield,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";
import { useAdminKycProfiles, useUpdateKycStatus } from "../../hooks/useAdminData";
import { adminApi } from "../../services/adminApi";
import type { ProProfileKycResponse, KycStatus } from "@/api/adminEndpoints";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  PENDING:       "En attente",
  VERIFIED:      "Vérifié",
  REJECTED:      "Refusé",
  NOT_SUBMITTED: "Non soumis",
};

const KYC_STATUS_COLORS: Record<KycStatus, string> = {
  PENDING:       "#FF9800",
  VERIFIED:      "#4CAF50",
  REJECTED:      "#F44336",
  NOT_SUBMITTED: "#9E9E9E",
};

/* ─── Sub-components ────────────────────────────────────────────────────────── */

function KycStatusBadge({ status }: { status: KycStatus }) {
  const color = KYC_STATUS_COLORS[status];
  return (
    <span className="admin-badge" style={{ backgroundColor: `${color}20`, color }}>
      {KYC_STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Downloads the KYC document as a blob and opens it in a new browser tab.
 * Works for images (JPEG/PNG) and PDF — the browser determines display.
 */
function useOpenKycDocument() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const open = async (userId: string) => {
    setLoadingId(userId);
    setErrorId(null);
    try {
      const blob = await adminApi.getKycDocument(userId);
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      // Revoke the object URL after the tab has had time to load the resource
      if (tab) {
        tab.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
      } else {
        // Popup blocked — let the URL live a bit longer then clean up
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
    } catch {
      setErrorId(userId);
    } finally {
      setLoadingId(null);
    }
  };

  return { open, loadingId, errorId };
}

/** Actions row for a single KYC profile card */
function KycCardActions({ profile }: { profile: ProProfileKycResponse }) {
  const updateKyc = useUpdateKycStatus();
  const { open, loadingId, errorId } = useOpenKycDocument();
  const [rejectComment, setRejectComment] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const isDocLoading = loadingId === profile.userId;
  const hasDocError = errorId === profile.userId;

  const approve = () => {
    updateKyc.mutate({ userId: profile.userId, status: "VERIFIED" });
  };

  const submitReject = () => {
    updateKyc.mutate({
      userId: profile.userId,
      status: "REJECTED",
      comment: rejectComment || undefined,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* View document button — always present if status isn't NOT_SUBMITTED */}
      {profile.kycStatus !== "NOT_SUBMITTED" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            className="dash-btn-secondary"
            onClick={() => open(profile.userId)}
            disabled={isDocLoading}
            style={{ fontSize: 13 }}
          >
            {isDocLoading ? (
              <><FiLoader /> Chargement…</>
            ) : (
              <><FiFileText /> Voir le document<FiExternalLink size={12} style={{ marginLeft: 2 }} /></>
            )}
          </button>
          {hasDocError && (
            <span style={{ fontSize: 12, color: "#F44336" }}>
              Impossible d'ouvrir le document
            </span>
          )}
        </div>
      )}

      {/* Approve / reject — only for PENDING */}
      {profile.kycStatus === "PENDING" && (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="dash-btn-primary"
              onClick={approve}
              disabled={updateKyc.isPending}
            >
              <FiCheckCircle /> Approuver
            </button>
            <button
              className="dash-btn-secondary"
              onClick={() => setShowRejectInput((v) => !v)}
              style={{ color: "#F44336", borderColor: "#F44336" }}
            >
              <FiXCircle /> Rejeter
            </button>
          </div>

          {showRejectInput && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <input
                type="text"
                className="admin-filter-select"
                placeholder="Motif de refus (optionnel)"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                style={{ flex: 1, fontSize: 12, padding: "6px 10px" }}
                autoFocus
              />
              <button
                className="dash-btn-secondary"
                onClick={submitReject}
                disabled={updateKyc.isPending}
                style={{ color: "#F44336", borderColor: "#F44336", whiteSpace: "nowrap" }}
              >
                {updateKyc.isPending ? <FiLoader /> : "Confirmer le refus"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────────── */

const KYCVerificationTab: React.FC = () => {
  const { data: profiles = [], isLoading, isError } = useAdminKycProfiles();

  const pending = profiles.filter((p) => p.kycStatus === "PENDING");

  return (
    <div className="admin-kyc-section">
      <div className="admin-section-header">
        <div>
          <h2>Vérification KYC</h2>
          <p className="admin-section-subtitle">
            {isLoading ? "Chargement…" : `${pending.length} en attente`}
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="dash-stats-grid" style={{ marginBottom: 24 }}>
        {(["PENDING", "VERIFIED", "REJECTED"] as KycStatus[]).map((status) => {
          const count = profiles.filter((p) => p.kycStatus === status).length;
          const icons: Record<KycStatus, React.ReactNode> = {
            PENDING:       <FiClock />,
            VERIFIED:      <FiCheckCircle />,
            REJECTED:      <FiXCircle />,
            NOT_SUBMITTED: <FiShield />,
          };
          const color = KYC_STATUS_COLORS[status];
          return (
            <div key={status} className="dash-stat-card">
              <div className="dash-stat-icon" style={{ background: `${color}20`, color }}>
                {icons[status]}
              </div>
              <div className="dash-stat-content">
                <span className="dash-stat-label">{KYC_STATUS_LABELS[status]}</span>
                <span className="dash-stat-value">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="admin-empty-state">
          <FiLoader className="admin-spinner" /> Chargement de la file KYC…
        </div>
      )}
      {isError && (
        <div className="admin-alert admin-alert-danger">
          Impossible de charger les demandes KYC.
        </div>
      )}

      {/* KYC queue */}
      {!isLoading && !isError && (
        <>
          {profiles.length === 0 ? (
            <div className="admin-kyc-card">
              <FiShield style={{ fontSize: 32, color: "#BDBDBD" }} />
              <div className="admin-kyc-info">
                <h3>Aucune demande KYC</h3>
                <p>Toutes les vérifications sont à jour.</p>
              </div>
            </div>
          ) : (
            <div className="admin-kyc-queue">
              {profiles.map((profile) => (
                <div key={profile.userId} className="admin-kyc-card">
                  {/* Identity and meta */}
                  <div className="admin-kyc-info">
                    <h3>{profile.firstName} {profile.lastName}</h3>
                    <p>{profile.email}</p>
                    {profile.documentType && (
                      <small>Document soumis : <strong>{profile.documentType}</strong></small>
                    )}
                    {profile.submittedAt && (
                      <small className="admin-text-muted">
                        <FiClock size={11} /> Soumis le{" "}
                        {new Date(profile.submittedAt).toLocaleDateString("fr-FR")}
                      </small>
                    )}
                    {profile.comment && (
                      <small style={{ color: "#F44336" }}>Note : {profile.comment}</small>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="admin-kyc-time">
                    <KycStatusBadge status={profile.kycStatus} />
                  </div>

                  {/* Actions: view document + approve/reject */}
                  <KycCardActions profile={profile} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KYCVerificationTab;
