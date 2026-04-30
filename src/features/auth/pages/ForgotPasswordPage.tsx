import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useForgotPassword } from "@/features/auth/services/auth.service";
import Logo from "@/components/shared/Logo";
import "../styles/Connexion.css";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    forgotPasswordMutation.mutate({ email });
  };

  return (
    <div className="connexion-container">
      <div className="connexion-card">
        <div className="connexion-logo">
          <Logo alt="Jobty" />
        </div>

        <h1 className="connexion-title">Mot de passe oublié</h1>

        <p className="connexion-subtitle">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>

        <form onSubmit={handleSubmit} className="connexion-form">
          <div className="form-group">
            <div className="input-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="input-icon-left"
                aria-hidden="true"
                width="18"
                height="18"
                style={{ color: "#46c6cb" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-.97 1.858l-7.5 5.25a2.25 2.25 0 0 1-2.56 0l-7.5-5.25a2.25 2.25 0 0 1-.97-1.858V6.75"
                />
              </svg>

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="off"
                className="forgot-password-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="submit-btn"
          >
            {forgotPasswordMutation.isPending
              ? "Envoi en cours..."
              : "Envoyer le lien"}
          </button>
        </form>

        <div className="auth-redirect-prompt" style={{ marginTop: "24px" }}>
          <button
            type="button"
            onClick={() => navigate("/connexion")}
            className="back-to-login-link"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
