import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useConfirmEmail } from "@/features/auth/services/auth.service.ts";
import { Button, Card, CardContent, CardTitle } from "@/components/ui";
import Logo from "@/components/shared/Logo";
import "../styles/Connexion.css";

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const confirmMutation = useConfirmEmail();
  const hasToken = Boolean(token);
  const hasConfirmedRef = useRef(false);

  useEffect(() => {
    if (!token || hasConfirmedRef.current) {
      return;
    }

    hasConfirmedRef.current = true;
    confirmMutation.mutate(token);
  }, [confirmMutation, token]);

  useEffect(() => {
    if (!confirmMutation.isSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/connexion");
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [confirmMutation.isSuccess, navigate]);

  const getContent = () => {
    if (!hasToken) {
      return {
        title: "Vérifiez votre e-mail",
        message: "Un email de confirmation a été envoyé à votre adresse.",
        helper:
          "Cliquez sur le lien dans l'email pour activer votre compte et commencer à générer du contenu.",
        footer:
          "Si vous ne trouvez pas l’email, vérifiez votre dossier spam ou courrier indésirable.",
      };
    }

    if (confirmMutation.isPending) {
      return {
        title: "Vérification en cours",
        message: "Nous validons votre e-mail en ce moment.",
        helper: "Veuillez patienter quelques secondes pendant la confirmation.",
        footer: "Vous serez redirigé ensuite vers votre espace.",
      };
    }

    if (confirmMutation.isSuccess) {
      return {
        title: "Adresse confirmée",
        message:
          confirmMutation.data?.message ||
          "Votre e-mail a été confirmé avec succès.",
        helper: "Votre compte est maintenant actif.",
        footer: "Redirection vers la page de connexion...",
      };
    }

    return {
      title: "Lien invalide",
      message:
        confirmMutation.error?.message ||
        "Impossible de confirmer votre e-mail avec ce lien.",
      helper: "Le lien peut être expiré ou déjà utilisé.",
      footer: "Essayez de demander un nouvel email de confirmation.",
    };
  };

  const content = getContent();

  return (
    <div className="connexion-container">
      <div className="connexion-card flex-center">
        <div className="connexion-logo">
          <Logo alt="Jobty" />
        </div>

        <div className="verification-icon-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="verification-icon"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-.97 1.858l-7.5 5.25a2.25 2.25 0 0 1-2.56 0l-7.5-5.25a2.25 2.25 0 0 1-.97-1.858V6.75"
            />
          </svg>
        </div>

        <h1 className="connexion-title">{content.title}</h1>

        <div className="verification-content">
          <p className="verification-message">{content.message}</p>
          <p className="verification-helper">{content.helper}</p>
          <p className="verification-footer">{content.footer}</p>
        </div>

        <button
          onClick={() => navigate("/connexion")}
          className="submit-btn"
        >
          Allez à la connexion
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
