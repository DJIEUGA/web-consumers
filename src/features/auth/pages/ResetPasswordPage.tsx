import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useResetPassword } from "@/features/auth/services/auth.service";
import Logo from "@/components/shared/Logo";
import { FiEye, FiEyeOff, FiKey, FiLock } from "react-icons/fi";
import { COLORS } from "@/styles/colors";
import "../styles/Connexion.css";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";

  const resetPasswordMutation = useResetPassword();

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isTokenMissing = useMemo(() => token.trim().length === 0, [token]);

  useEffect(() => {
    if (!resetPasswordMutation.isSuccess) return;

    const timeoutId = window.setTimeout(() => {
      navigate("/connexion");
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [navigate, resetPasswordMutation.isSuccess]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isTokenMissing) {
      setValidationError("Le token de réinitialisation est requis.");
      return;
    }

    if (password.length < 8) {
      setValidationError(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setValidationError(
        "Le mot de passe doit contenir au moins une lettre et un chiffre.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Les mots de passe ne correspondent pas.");
      return;
    }

    setValidationError(null);
    resetPasswordMutation.mutate({ token, newPassword: confirmPassword });
  };

  return (
    <div className="connexion-container">
      <div className="connexion-card">
        <div className="connexion-logo">
          <Logo alt="Jobty" />
        </div>

        <h1 className="connexion-title">Nouveau mot de passe</h1>

        <p className="connexion-subtitle">
          Choisissez un nouveau mot de passe sécurisé pour votre compte
        </p>

        <form onSubmit={handleSubmit} className="connexion-form">
          <div className="form-group">
            <div className="input-wrapper">
              <FiKey className="input-icon-left" />
              <input
                type="text"
                placeholder="Token de réinitialisation"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FiLock className="input-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Entrer nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FiLock className="input-icon-left" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmer nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="password-requirements">
            <p>Le mot de passe doit contenir :</p>
            <ul>
              <li>Au moins 8 caractères</li>
              <li>Au moins une lettre et un chiffre</li>
            </ul>
          </div>

          {validationError && (
            <p className="error-message-center">
              {validationError}
            </p>
          )}

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="submit-btn"
          >
            {resetPasswordMutation.isPending ? "Traitement..." : "Réinitialiser"}
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

export default ResetPasswordPage;
