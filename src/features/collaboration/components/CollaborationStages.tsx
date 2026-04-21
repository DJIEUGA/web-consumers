import React from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiFile,
  FiList,
  FiLock,
  FiMessageCircle,
  FiMessageSquare,
  FiPlay,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiTarget,
  FiThumbsDown,
  FiThumbsUp,
  FiUpload,
  FiX,
  FiZap,
} from "react-icons/fi";
import { FaHandshake, FaRocket } from "react-icons/fa";
import Logo from "@/components/shared/Logo";
import { CollabChatBox } from "@/features/collaboration/components/CollabChatBox";
import type {
  AvisState,
  BriefState,
  CollaborationActor,
  CollaborationDecisionState,
  ContratAccepteState,
  ProjectEtape,
  UiMessage,
} from "@/features/collaboration/types/workflow";

type PersonSummary = {
  nom: string;
  photo: string;
  poste?: string;
  entreprise?: string;
};

type StepContactProps = {
  messages: UiMessage[];
  porteurPhoto: string;
  freelancePhoto: string;
  newMessage: string;
  onMessageChange: React.Dispatch<React.SetStateAction<string>>;
  handleKeyPress: (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  onSendMessage: () => Promise<void>;
  onRetryMessage: (messageId: string) => Promise<void>;
  isMessagingLocked: boolean;
  messagingStatusNotice: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isRecording: boolean;
  onToggleRecording: () => void;
  canPropose: boolean;
  onProposeCollaboration: () => Promise<void>;
};

export const StepContact = ({
  messages,
  porteurPhoto,
  freelancePhoto,
  newMessage,
  onMessageChange,
  handleKeyPress,
  onSendMessage,
  onRetryMessage,
  isMessagingLocked,
  messagingStatusNotice,
  messagesEndRef,
  isRecording,
  onToggleRecording,
  canPropose,
  onProposeCollaboration,
}: StepContactProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#667eea20" }}
        >
          <FiMessageCircle style={{ color: "#667eea" }} />
        </div>
        <div>
          <h2>Prise de contact</h2>
          <p>
            Présentez-vous et clarifiez vos besoins. Aucun engagement à cette
            étape.
          </p>
        </div>
      </div>

      <div className="collab-alert-info">
        <FiAlertCircle />
        <span>
          Messagerie limitée - Pas de paiement, pas d'échange de coordonnées
          personnelles
        </span>
      </div>

      <CollabChatBox
        messages={messages}
        porteurPhoto={porteurPhoto}
        freelancePhoto={freelancePhoto}
        newMessage={newMessage}
        onMessageChange={onMessageChange}
        onKeyPress={handleKeyPress}
        onSend={() => {
          void onSendMessage();
        }}
        onRetryMessage={(messageId) => {
          void onRetryMessage(messageId);
        }}
        isMessagingLocked={isMessagingLocked}
        messagingStatusNotice={messagingStatusNotice}
        messagesEndRef={messagesEndRef}
        showComposerTools
        isRecording={isRecording}
        onToggleRecording={onToggleRecording}
      />

      <div className="collab-step-actions">
        {canPropose ? (
          <button
            className="collab-btn-primary"
            onClick={() => {
              void onProposeCollaboration();
            }}
          >
            <FaRocket /> Proposer une collaboration
          </button>
        ) : (
          <div className="collab-alert-info" style={{ marginBottom: 0 }}>
            <FiAlertCircle />
            <span>
              Seul le client peut initier une demande de collaboration dans
              cette étape.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

type StepDecisionProps = {
  isPro: boolean;
  porteur?: PersonSummary;
  freelance?: PersonSummary;
  requestContextMessage: string;
  actor: CollaborationActor;
  decisionState: CollaborationDecisionState;
  onAcceptCollaboration: () => Promise<void>;
  onRequestMoreInfo: () => void;
  onDeclineCollaboration: () => Promise<void>;
  onBackToContact: () => void;
};

export const StepDecision = ({
  isPro,
  porteur,
  freelance,
  requestContextMessage,
  actor,
  decisionState,
  onAcceptCollaboration,
  onRequestMoreInfo,
  onDeclineCollaboration,
  onBackToContact,
}: StepDecisionProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#fd7e1420" }}
        >
          <FiCheck style={{ color: "#fd7e14" }} />
        </div>
        <div>
          <h2>En attente de réponse</h2>
          <p>
            {isPro
              ? "Un porteur de projet vous a envoye une demande de collaboration."
              : "Le professionnel examine votre demande de collaboration"}
          </p>
        </div>
      </div>

      <div className="collab-waiting-card">
        {isPro ? (
          <>
            <div className="collab-waiting-animation">
              <div className="collab-pulse-ring"></div>
              <img
                src={porteur?.photo}
                alt={porteur?.nom}
                className="collab-waiting-photo"
              />
            </div>
            <h3>{porteur?.nom}</h3>
          </>
        ) : (
          <>
            <div className="collab-waiting-animation">
              <div className="collab-pulse-ring"></div>
              <img
                src={freelance?.photo}
                alt={freelance?.nom}
                className="collab-waiting-photo"
              />
            </div>
            <h3>{freelance?.nom}</h3>
          </>
        )}

        {isPro && requestContextMessage && (
          <div className="collab-alert-info" style={{ marginTop: 12 }}>
            <FiMessageCircle />
            <span>{requestContextMessage}</span>
          </div>
        )}

        {isPro && (
          <div className="collab-waiting-options">
            <div className="collab-option-card accept">
              <FiCheckCircle />
              <button
                className="cursor-pointer"
                onClick={() => {
                  void onAcceptCollaboration();
                }}
              >
                <span>Accepter</span>
              </button>
            </div>
            <div className="collab-option-card info">
              <FiMessageCircle />
              <button className="cursor-pointer" onClick={onRequestMoreInfo}>
                <span>Plus d'infos</span>
              </button>
            </div>
            <div className="collab-option-card decline">
              <FiX />
              <button
                className="cursor-pointer"
                onClick={() => {
                  void onDeclineCollaboration();
                }}
              >
                <span>Refuser</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {actor !== "pro" && (
        <div className="collab-demo-actions">
          <p className="collab-demo-note">
            {decisionState === "pending" &&
              "Le professionnel n'a pas encore répondu. Vous serez notifié dès qu'il prend une décision."}
            {decisionState === "more_info" &&
              "Le professionnel demande des précisions. Revenez en prise de contact pour compléter votre besoin."}
            {decisionState === "declined" &&
              "Demande refusée. Vous pouvez reformuler puis envoyer une nouvelle proposition."}
          </p>
          {(decisionState === "more_info" || decisionState === "declined") && (
            <button className="collab-btn-secondary" onClick={onBackToContact}>
              <FiArrowLeft /> Retour à la prise de contact
            </button>
          )}
        </div>
      )}
    </div>
  );
};

type StepMatchProps = {
  isOwnerIdentityLoading: boolean;
  isFreelanceIdentityLoading: boolean;
  porteur: PersonSummary;
  freelance: PersonSummary;
  canOpenBrief: boolean;
  onOpenBrief: () => void;
};

export const StepMatch = ({
  isOwnerIdentityLoading,
  isFreelanceIdentityLoading,
  porteur,
  freelance,
  canOpenBrief,
  onOpenBrief,
}: StepMatchProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header success">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#28a74520" }}
        >
          <FaHandshake style={{ color: "#28a745" }} />
        </div>
        <div>
          <h2>On bosse ensemble ! 🎉</h2>
          <p>Votre espace projet privé a été créé</p>
        </div>
      </div>

      <div className="collab-match-success-card">
        <div className="collab-match-users">
          <div className="collab-match-user">
            {isOwnerIdentityLoading ? (
              <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-sm" />
            ) : (
              <img src={porteur.photo} alt={porteur.nom} />
            )}
            {isOwnerIdentityLoading ? (
              <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
            ) : (
              <span>{porteur.nom}</span>
            )}
            <span className="collab-role">Porteur de projet</span>
          </div>
          <div className="collab-match-connector">
            <FaHandshake />
          </div>
          <div className="collab-match-user">
            {isFreelanceIdentityLoading ? (
              <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-sm" />
            ) : (
              <img src={freelance.photo} alt={freelance.nom} />
            )}
            {isFreelanceIdentityLoading ? (
              <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
            ) : (
              <span>{freelance.nom}</span>
            )}
            <span className="collab-role">Professionnel</span>
          </div>
        </div>

        <div className="collab-features-list">
          <div className="collab-feature-item">
            <FiCheckCircle className="collab-feature-check" />
            <span>Espace privé sécurisé</span>
          </div>
          <div className="collab-feature-item">
            <FiCheckCircle className="collab-feature-check" />
            <span>Historique horodaté (preuves légales)</span>
          </div>
          <div className="collab-feature-item">
            <FiCheckCircle className="collab-feature-check" />
            <span>Paiement sécurisé</span>
          </div>
          <div className="collab-feature-item">
            <FiCheckCircle className="collab-feature-check" />
            <span>Support Jobty 24/7</span>
          </div>
        </div>
      </div>

      <div className="collab-step-actions">
        {canOpenBrief ? (
          <button className="collab-btn-primary" onClick={onOpenBrief}>
            <FiEdit3 /> Rédiger le brief du projet
          </button>
        ) : (
          <div className="collab-alert-info" style={{ marginBottom: 0 }}>
            <FiAlertCircle />
            <span>
              Le client prépare le brief. Vous serez invité à le valider dès
              qu'il est prêt.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

type StepBriefProps = {
  brief: BriefState;
  setBrief: React.Dispatch<React.SetStateAction<BriefState>>;
  briefProgress: number;
  livrablesSuggestions: string[];
  isCustomer: boolean;
  onBackToMatch: () => void;
  validerBrief: () => void;
  confirmerReceptionBrief: () => void;
  toggleLivrable: (livrable: string) => void;
  freelance: PersonSummary;
};

export const StepBrief = ({
  brief,
  setBrief,
  briefProgress,
  livrablesSuggestions,
  isCustomer,
  onBackToMatch,
  validerBrief,
  confirmerReceptionBrief,
  toggleLivrable,
  freelance,
}: StepBriefProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#667eea20" }}
        >
          <FiFile style={{ color: "#667eea" }} />
        </div>
        <div>
          <h2>Brief express</h2>
          <p>Décrivez votre projet de manière simple et claire</p>
        </div>
      </div>

      <div className="collab-brief-progress">
        <div className="collab-brief-progress-bar">
          <div
            className="collab-brief-progress-fill"
            style={{ width: `${briefProgress}%` }}
          ></div>
        </div>
        <span
          className={`collab-brief-progress-text ${briefProgress === 100 ? "complete" : ""}`}
        >
          {briefProgress === 100
            ? "✅ Brief complété !"
            : `Brief complété à ${briefProgress}%`}
        </span>
      </div>

      <div className="collab-brief-form">
        <div className="collab-form-group">
          <label>
            <FiTarget /> Objectif du projet *
          </label>
          <textarea
            placeholder="Décrivez ce que vous souhaitez réaliser..."
            value={brief.objectif}
            onChange={(e) =>
              setBrief((prev) => ({ ...prev, objectif: e.target.value }))
            }
            disabled={!isCustomer}
            rows={3}
          />
        </div>

        <div className="collab-form-group">
          <label>
            <FiList /> Livrables attendus *
          </label>
          <div className="collab-livrables-grid">
            {livrablesSuggestions.map((livrable, index) => (
              <div
                key={index}
                className={`collab-livrable-item ${brief.livrables.includes(livrable) ? "selected" : ""}`}
                onClick={() => isCustomer && toggleLivrable(livrable)}
              >
                <FiCheckCircle />
                <span>{livrable}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="collab-form-group">
          <label>
            <FiCalendar /> Délai souhaité *
          </label>
          <select
            value={brief.delai}
            onChange={(e) =>
              setBrief((prev) => ({ ...prev, delai: e.target.value }))
            }
            disabled={!isCustomer}
          >
            <option value="">Sélectionnez un délai</option>
            <option value="Moins d'1 semaine">Moins d'1 semaine</option>
            <option value="1-2 semaines">1-2 semaines</option>
            <option value="2-4 semaines">2-4 semaines</option>
            <option value="1-2 mois">1-2 mois</option>
            <option value="Plus de 2 mois">Plus de 2 mois</option>
          </select>
        </div>

        <div className="collab-form-group">
          <label>
            <FiDollarSign /> Budget validé *
          </label>
          <div className="collab-budget-input">
            <input
              type="number"
              placeholder="Ex: 200000"
              value={brief.budget}
              onChange={(e) =>
                setBrief((prev) => ({ ...prev, budget: e.target.value }))
              }
              disabled={!isCustomer}
            />
            <span className="collab-currency">FCFA</span>
          </div>
        </div>

        <div className="collab-form-group">
          <label>
            <FiUpload /> Fichiers utiles (optionnel)
          </label>
          <div className="collab-upload-zone">
            <FiUpload />
            <span>Glissez vos fichiers ici ou cliquez pour uploader</span>
            <small>PDF, Images, Documents (max 10MB)</small>
          </div>
        </div>

        {!isCustomer && (
          <div className="collab-alert-info">
            <FiAlertCircle />
            <span>
              Le brief est saisi par le client. Vous pouvez l'examiner et
              confirmer sa reception.
            </span>
          </div>
        )}
      </div>

      <div className="collab-pro-comment">
        <div className="collab-pro-comment-header">
          <img src={freelance.photo} alt={freelance.nom} />
          <span>Commentaire de {freelance.nom.split(" ")[0]}</span>
        </div>
        <div className="collab-pro-comment-content">
          <p>
            Le brief me semble clair ! Je suis prêt à démarrer dès validation.
            👍
          </p>
        </div>
      </div>

      <div className="collab-step-actions">
        {isCustomer ? (
          <>
            <button className="collab-btn-secondary" onClick={onBackToMatch}>
              <FiArrowLeft /> Retour
            </button>
            <button
              className={`collab-btn-primary ${briefProgress < 100 ? "disabled" : ""}`}
              onClick={validerBrief}
              disabled={briefProgress < 100}
            >
              <FiCheck /> Valider le brief
            </button>
          </>
        ) : (
          <button
            className="collab-btn-primary"
            onClick={confirmerReceptionBrief}
          >
            <FiCheck /> Confirmer la reception du brief
          </button>
        )}
      </div>
    </div>
  );
};

type StepContractProps = {
  brief: BriefState;
  porteur: PersonSummary;
  freelance: PersonSummary;
  contratAccepte: ContratAccepteState;
  setContratAccepte: React.Dispatch<React.SetStateAction<ContratAccepteState>>;
  isCustomer: boolean;
  isPro: boolean;
  isOwnerIdentityLoading: boolean;
  isFreelanceIdentityLoading: boolean;
  accepterContrat: (partie: keyof ContratAccepteState) => void;
};

export const StepContract = ({
  brief,
  porteur,
  freelance,
  contratAccepte,
  setContratAccepte,
  isCustomer,
  isPro,
  isOwnerIdentityLoading,
  isFreelanceIdentityLoading,
  accepterContrat,
}: StepContractProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#17a2b820" }}
        >
          <FiFile style={{ color: "#17a2b8" }} />
        </div>
        <div>
          <h2>Contrat digital simplifié</h2>
          <p>Validez les termes de votre collaboration en 1 clic</p>
        </div>
      </div>

      <div className="collab-contrat-card">
        <div className="collab-contrat-header">
          <Logo alt="Jobty" className="collab-contrat-logo" />
          <div>
            <h3>Contrat de prestation Jobty</h3>
            <span>
              Généré automatiquement le {new Date().toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>

        <div className="collab-contrat-body">
          <div className="collab-contrat-parties">
            <div className="collab-contrat-partie">
              <h4>Porteur de projet</h4>
              <p>{porteur.nom}</p>
              <span>{porteur.entreprise}</span>
            </div>
            <div className="collab-contrat-vs">×</div>
            <div className="collab-contrat-partie">
              <h4>Prestataire</h4>
              <p>{freelance.nom}</p>
              <span>{freelance.poste}</span>
            </div>
          </div>

          <div className="collab-contrat-section">
            <h4>
              <FiTarget /> Objet du contrat
            </h4>
            <p>
              {brief.objectif ||
                "Développement d'une application web responsive"}
            </p>
          </div>

          <div className="collab-contrat-section">
            <h4>
              <FiList /> Livrables
            </h4>
            <ul>
              {brief.livrables.length > 0 ? (
                brief.livrables.map((l, i) => <li key={i}>{l}</li>)
              ) : (
                <>
                  <li>Maquette graphique</li>
                  <li>Code source</li>
                  <li>Documentation</li>
                </>
              )}
            </ul>
          </div>

          <div className="collab-contrat-row">
            <div className="collab-contrat-section half">
              <h4>
                <FiCalendar /> Délai
              </h4>
              <p>{brief.delai || "2-4 semaines"}</p>
            </div>
            <div className="collab-contrat-section half">
              <h4>
                <FiDollarSign /> Montant total
              </h4>
              <p className="collab-contrat-amount">
                {brief.budget
                  ? parseInt(brief.budget).toLocaleString()
                  : "200 000"}{" "}
                FCFA
              </p>
            </div>
          </div>

          <div className="collab-contrat-section">
            <h4>
              <FiShield /> Conditions Jobty
            </h4>
            <ul className="collab-conditions">
              <li>Paiement sécurisé via séquestre Jobty</li>
              <li>Libération des fonds après validation</li>
              <li>Médiation Jobty en cas de litige</li>
              <li>Historique complet conservé 2 ans</li>
            </ul>
          </div>
        </div>

        <div className="collab-contrat-signatures">
          <div
            className={`collab-signature ${contratAccepte.porteur ? "signed" : ""}`}
          >
            {isOwnerIdentityLoading ? (
              <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-xs" />
            ) : (
              <img src={porteur.photo} alt={porteur.nom} />
            )}
            {isOwnerIdentityLoading ? (
              <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
            ) : (
              <span>{porteur.nom}</span>
            )}
            {contratAccepte.porteur ? (
              <div className="collab-signature-done">
                <FiCheckCircle /> Signé
              </div>
            ) : !isCustomer ? (
              <div className="collab-demo-note">
                En attente de signature client
              </div>
            ) : (
              <button
                className="collab-sign-btn"
                onClick={() => accepterContrat("porteur")}
              >
                J'accepte
              </button>
            )}
          </div>

          <div
            className={`collab-signature ${contratAccepte.freelance ? "signed" : ""}`}
          >
            {isFreelanceIdentityLoading ? (
              <div className="collab-skeleton collab-avatar-skeleton collab-avatar-skeleton-xs" />
            ) : (
              <img src={freelance.photo} alt={freelance.nom} />
            )}
            {isFreelanceIdentityLoading ? (
              <span className="collab-skeleton collab-text-skeleton collab-text-skeleton-name-sm" />
            ) : (
              <span>{freelance.nom}</span>
            )}
            {contratAccepte.freelance ? (
              <div className="collab-signature-done">
                <FiCheckCircle /> Signé
              </div>
            ) : !isPro ? (
              <div className="collab-demo-note">
                En attente de signature pro
              </div>
            ) : (
              <button
                className="collab-sign-btn"
                onClick={() => accepterContrat("freelance")}
              >
                J'accepte
              </button>
            )}
          </div>
        </div>
      </div>

      {isCustomer && !contratAccepte.freelance && (
        <div className="collab-demo-actions">
          <p className="collab-demo-note">
            🎮 Demo : Simuler la signature du freelance
          </p>
          <button
            className="collab-btn-outline"
            onClick={() =>
              setContratAccepte((prev) => ({ ...prev, freelance: true }))
            }
          >
            <FiCheck /> Le freelance signe
          </button>
        </div>
      )}
    </div>
  );
};

type StepPaymentProps = {
  isCustomer: boolean;
  modePaiement: string;
  setModePaiement: React.Dispatch<React.SetStateAction<string>>;
  etapes: ProjectEtape[];
  briefBudget: string;
  paiementDepose: boolean;
  deposerPaiement: () => void;
};

export const StepPayment = ({
  isCustomer,
  modePaiement,
  setModePaiement,
  etapes,
  briefBudget,
  paiementDepose,
  deposerPaiement,
}: StepPaymentProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#28a74520" }}
        >
          <FiLock style={{ color: "#28a745" }} />
        </div>
        <div>
          <h2>Paiement sécurisé</h2>
          <p>
            Déposez le paiement - Il restera bloqué jusqu'à validation des
            livrables
          </p>
        </div>
      </div>

      <div className="collab-paiement-card">
        {!isCustomer && (
          <div className="collab-alert-info" style={{ marginBottom: 16 }}>
            <FiClock />
            <span>
              Seul le client depose le paiement. Vous serez notifie une fois les
              fonds securises.
            </span>
          </div>
        )}
        <div className="collab-paiement-mode">
          <label className="collab-radio-card">
            <input
              type="radio"
              name="mode"
              value="etapes"
              checked={modePaiement === "etapes"}
              onChange={() => setModePaiement("etapes")}
              disabled={!isCustomer}
            />
            <div className="collab-radio-content">
              <div className="collab-radio-icon recommended">
                <FiList />
                <span className="collab-badge-recommended">Recommandé</span>
              </div>
              <h4>Paiement par étapes</h4>
              <p>Déblocage progressif selon les livrables validés</p>
            </div>
          </label>
          <label className="collab-radio-card">
            <input
              type="radio"
              name="mode"
              value="total"
              checked={modePaiement === "total"}
              onChange={() => setModePaiement("total")}
              disabled={!isCustomer}
            />
            <div className="collab-radio-content">
              <div className="collab-radio-icon">
                <FiDollarSign />
              </div>
              <h4>Paiement total</h4>
              <p>Déblocage unique à la fin du projet</p>
            </div>
          </label>
        </div>

        {modePaiement === "etapes" && (
          <div className="collab-etapes-paiement">
            <h4>Répartition par étapes</h4>
            {etapes.map((etape, index) => (
              <div key={etape.id} className="collab-etape-paiement-item">
                <span className="collab-etape-num">Étape {index + 1}</span>
                <span className="collab-etape-titre">{etape.titre}</span>
                <span className="collab-etape-montant">
                  {etape.montant.toLocaleString()} FCFA
                </span>
              </div>
            ))}
            <div className="collab-paiement-total">
              <span>Total</span>
              <span>
                {etapes.reduce((sum, e) => sum + e.montant, 0).toLocaleString()}{" "}
                FCFA
              </span>
            </div>
          </div>
        )}

        {modePaiement === "total" && (
          <div className="collab-total-paiement">
            <div className="collab-paiement-total">
              <span>Montant total</span>
              <span>
                {(briefBudget
                  ? parseInt(briefBudget)
                  : 200000
                ).toLocaleString()}{" "}
                FCFA
              </span>
            </div>
          </div>
        )}

        <div className="collab-paiement-secure-info">
          <FiShield />
          <div>
            <h5>Votre argent est sécurisé</h5>
            <p>
              Les fonds sont conservés par Jobty et libérés uniquement après
              votre validation des livrables.
            </p>
          </div>
        </div>

        <button
          className={`collab-btn-primary collab-btn-large ${paiementDepose ? "success" : ""}`}
          onClick={deposerPaiement}
          disabled={paiementDepose || !isCustomer}
        >
          {paiementDepose ? (
            <>
              <FiCheckCircle /> Paiement déposé avec succès !
            </>
          ) : (
            <>
              <FiLock /> Déposer le paiement
            </>
          )}
        </button>
      </div>

      {paiementDepose && (
        <div className="collab-success-message">
          <FiCheckCircle />
          <div>
            <h4>Parfait ! Le pro peut commencer.</h4>
            <p>
              Votre argent est sécurisé. Redirection vers l'espace de travail...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

type StepExecutionProps = {
  etapes: ProjectEtape[];
  getStatutBadge: (statut: string) => React.ReactNode;
  isPro: boolean;
  isCustomer: boolean;
  livrerEtape: (etapeId: number) => void;
  validerEtape: (etapeId: number) => void;
  demanderModification: (etapeId: number) => void;
  messages: UiMessage[];
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleKeyPress: (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  sendMessage: () => Promise<void>;
  onRetryMessage: (messageId: string) => Promise<void>;
  isMessagingLocked: boolean;
  messagingStatusNotice: string;
  porteurPhoto: string;
  freelancePhoto: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setEtapes: React.Dispatch<React.SetStateAction<ProjectEtape[]>>;
  transitionToStep: (
    nextStep: number,
    eventType: "STEP_CHANGED",
    payload?: Record<string, unknown>,
  ) => void;
};

export const StepExecution = ({
  etapes,
  getStatutBadge,
  isPro,
  isCustomer,
  livrerEtape,
  validerEtape,
  demanderModification,
  messages,
  newMessage,
  setNewMessage,
  handleKeyPress,
  sendMessage,
  onRetryMessage,
  isMessagingLocked,
  messagingStatusNotice,
  porteurPhoto,
  freelancePhoto,
  messagesEndRef,
  setEtapes,
  transitionToStep,
}: StepExecutionProps) => {
  return (
    <div className="collab-step-content collab-workspace-view">
      <div className="collab-step-header">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#667eea20" }}
        >
          <FiTarget style={{ color: "#667eea" }} />
        </div>
        <div>
          <h2>Tableau de collaboration</h2>
          <p>Suivez l'avancement de votre projet en temps réel</p>
        </div>
      </div>

      <div className="collab-timeline">
        <h3>
          <FiList /> Timeline du projet
        </h3>
        <div className="collab-timeline-items">
          {etapes.map((etape, index) => (
            <div
              key={etape.id}
              className={`collab-timeline-item ${etape.statut}`}
            >
              <div className="collab-timeline-marker">
                {etape.statut === "validee" ? (
                  <FiCheckCircle />
                ) : etape.statut === "en_cours" ? (
                  <FiPlay />
                ) : etape.statut === "livree" ? (
                  <FiUpload />
                ) : (
                  <FiClock />
                )}
              </div>
              <div className="collab-timeline-content">
                <div className="collab-timeline-header">
                  <h4>
                    Étape {index + 1}: {etape.titre}
                  </h4>
                  {getStatutBadge(etape.statut)}
                </div>
                {etape.statut === "en_cours" && (
                  <div className="collab-progress-mini">
                    <div className="collab-progress-bar-mini">
                      <div
                        className="collab-progress-fill-mini"
                        style={{ width: `${etape.progression}%` }}
                      ></div>
                    </div>
                    <span>{etape.progression}%</span>
                  </div>
                )}
                <div className="collab-timeline-amount">
                  <FiDollarSign /> {etape.montant.toLocaleString()} FCFA
                  {etape.statut === "validee" && (
                    <span className="collab-released">💰 Libéré</span>
                  )}
                </div>

                {isPro && etape.statut === "en_cours" && (
                  <div className="collab-timeline-actions">
                    <button
                      className="collab-btn-sm collab-btn-outline"
                      onClick={() => livrerEtape(etape.id)}
                    >
                      <FiUpload /> Marquer comme livrée (démo)
                    </button>
                  </div>
                )}
                {isCustomer && etape.statut === "livree" && (
                  <div className="collab-timeline-actions">
                    <button
                      className="collab-btn-sm collab-btn-success"
                      onClick={() => validerEtape(etape.id)}
                    >
                      <FiCheck /> Valider
                    </button>
                    <button
                      className="collab-btn-sm collab-btn-warning"
                      onClick={() => demanderModification(etape.id)}
                    >
                      <FiRefreshCw /> Demander modification
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="collab-project-chat">
        <h3>
          <FiMessageSquare /> Messagerie projet
        </h3>
        <CollabChatBox
          messages={messages.slice(-3)}
          porteurPhoto={porteurPhoto}
          freelancePhoto={freelancePhoto}
          newMessage={newMessage}
          onMessageChange={setNewMessage}
          onKeyPress={handleKeyPress}
          onSend={() => {
            void sendMessage();
          }}
          onRetryMessage={(messageId) => {
            void onRetryMessage(messageId);
          }}
          isMessagingLocked={isMessagingLocked}
          messagingStatusNotice={messagingStatusNotice}
          messagesEndRef={messagesEndRef}
          compact
        />
      </div>

      {isCustomer && (
        <div className="collab-demo-actions">
          <p className="collab-demo-note">
            🎮 Demo : Simuler la validation de toutes les étapes
          </p>
          <button
            className="collab-btn-outline"
            onClick={() => {
              setEtapes((prev) =>
                prev.map((e) => ({ ...e, statut: "validee" as const })),
              );
              setTimeout(
                () =>
                  transitionToStep(9, "STEP_CHANGED", {
                    reason: "all_milestones_validated_demo",
                  }),
                1500,
              );
            }}
          >
            <FiCheck /> Tout valider et clôturer
          </button>
        </div>
      )}
    </div>
  );
};

type StepClosureProps = {
  etapes: ProjectEtape[];
  isCustomer: boolean;
  freelance: PersonSummary;
  isCheckingExistingReview: boolean;
  hasExistingReview: boolean;
  avis: AvisState;
  setAvis: React.Dispatch<React.SetStateAction<AvisState>>;
  renderStars: (note: number, interactive?: boolean) => React.ReactNode;
  onBackMarketplace: () => void;
  submitReview: () => Promise<void>;
  submitReviewPending: boolean;
  reviewSubmitSuccess: boolean;
};

export const StepClosure = ({
  etapes,
  isCustomer,
  freelance,
  isCheckingExistingReview,
  hasExistingReview,
  avis,
  setAvis,
  renderStars,
  onBackMarketplace,
  submitReview,
  submitReviewPending,
  reviewSubmitSuccess,
}: StepClosureProps) => {
  return (
    <div className="collab-step-content">
      <div className="collab-step-header success">
        <div
          className="collab-step-icon"
          style={{ backgroundColor: "#28a74520" }}
        >
          <FiAward style={{ color: "#28a745" }} />
        </div>
        <div>
          <h2>Projet terminé ! 🎉</h2>
          <p>Félicitations pour cette belle collaboration</p>
        </div>
      </div>

      <div className="collab-cloture-card">
        <div className="collab-cloture-header">
          <div className="collab-cloture-badge">
            <FiCheckCircle />
            <span>Collaboration réussie</span>
          </div>
        </div>

        <div className="collab-cloture-summary">
          <div className="collab-cloture-item">
            <FiDollarSign />
            <div>
              <span className="collab-cloture-label">Montant total</span>
              <span className="collab-cloture-value">
                {etapes.reduce((sum, e) => sum + e.montant, 0).toLocaleString()}{" "}
                FCFA
              </span>
            </div>
          </div>
          <div className="collab-cloture-item">
            <FiCalendar />
            <div>
              <span className="collab-cloture-label">Durée du projet</span>
              <span className="collab-cloture-value">14 jours</span>
            </div>
          </div>
          <div className="collab-cloture-item">
            <FiList />
            <div>
              <span className="collab-cloture-label">Étapes validées</span>
              <span className="collab-cloture-value">
                {etapes.length}/{etapes.length}
              </span>
            </div>
          </div>
        </div>

        {isCustomer ? (
          <div className="collab-rating-section">
            <h3>
              Notez votre collaboration avec {freelance.nom.split(" ")[0]}
            </h3>
            {isCheckingExistingReview && (
              <p className="collab-demo-note">
                Verification d'un avis existant en cours...
              </p>
            )}
            {hasExistingReview && (
              <div className="collab-alert-info" style={{ marginBottom: 12 }}>
                <FiCheckCircle />
                <span>
                  Vous avez deja depose un avis pour ce projet. Merci !
                </span>
              </div>
            )}
            <div className="collab-rating-stars">
              {renderStars(avis.note, true)}
            </div>
            <textarea
              placeholder="Partagez votre expérience (optionnel)"
              value={avis.commentaire}
              onChange={(e) =>
                setAvis((prev) => ({ ...prev, commentaire: e.target.value }))
              }
              rows={3}
            />
            <div className="collab-recommande">
              <span>Recommanderiez-vous ce professionnel ?</span>
              <div className="collab-recommande-btns">
                <button
                  className={`collab-recommande-btn ${avis.recommande === true ? "active yes" : ""}`}
                  onClick={() =>
                    setAvis((prev) => ({ ...prev, recommande: true }))
                  }
                >
                  <FiThumbsUp /> Oui
                </button>
                <button
                  className={`collab-recommande-btn ${avis.recommande === false ? "active no" : ""}`}
                  onClick={() =>
                    setAvis((prev) => ({ ...prev, recommande: false }))
                  }
                >
                  <FiThumbsDown /> Non
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="collab-alert-info" style={{ marginBottom: 12 }}>
            <FiCheckCircle />
            <span>
              Le client peut laisser un avis final. Merci pour votre
              collaboration.
            </span>
          </div>
        )}

        <div className="collab-badges-section">
          <h4>
            <FiAward /> Badges obtenus
          </h4>
          <div className="collab-badges-grid">
            <div className="collab-badge-item">
              <div className="collab-badge-icon gold">
                <FaHandshake />
              </div>
              <span>Collaboration réussie</span>
            </div>
            <div className="collab-badge-item">
              <div className="collab-badge-icon blue">
                <FiZap />
              </div>
              <span>Livraison rapide</span>
            </div>
            <div className="collab-badge-item">
              <div className="collab-badge-icon green">
                <FiShield />
              </div>
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </div>

        <div className="collab-step-actions">
          <button className="collab-btn-secondary" onClick={onBackMarketplace}>
            <FiArrowLeft /> Retour au marketplace
          </button>
          {isCustomer && (
            <button
              className="collab-btn-primary"
              onClick={() => {
                void submitReview();
              }}
              disabled={
                submitReviewPending ||
                reviewSubmitSuccess ||
                hasExistingReview ||
                isCheckingExistingReview
              }
            >
              {reviewSubmitSuccess ? (
                <>
                  <FiCheckCircle /> Avis publié
                </>
              ) : submitReviewPending ? (
                <>
                  <FiClock /> Publication...
                </>
              ) : (
                <>
                  <FiSend /> Publier mon avis
                </>
              )}
            </button>
          )}
        </div>

        {reviewSubmitSuccess && (
          <div className="collab-success-message" style={{ marginTop: 16 }}>
            <FiCheckCircle />
            <div>
              <h4>Merci, votre avis a été enregistré.</h4>
              <p>Votre retour aide la communauté Jobty.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
