import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useResetPassword } from "@/features/auth/services/auth.service";
import logo from "@/assets/logo.png";
import { FiEye, FiEyeOff, FiKey, FiLock } from "react-icons/fi";
import { COLORS } from "@/styles/colors";

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

    if (password.length < 6) {
      setValidationError(
        "Le mot de passe doit contenir au moins 6 caractères.",
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
    resetPasswordMutation.mutate({ token, password });
  };

  return (
    <div className="connexion-container">
      <div className="connexion-card">
        <div className="connexion-logo">
          <img src={logo} alt="Jobty" className="w-auto" />
        </div>

        <h1 className="connexion-title">Nouveau mot de passe</h1>

        <p className="connexion-subtitle mb-6 text-center text-xs text-[#8a8fa3]">
          Choisissez un nouveau mot de passe sécurisé
        </p>

        <form onSubmit={handleSubmit} className="connexion-form">
          <div className="w-3/4 self-center-safe">
            <label className="form-input-group relative">
              <FiKey className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#46c6cb]" />
              <input
                type="text"
                placeholder="Token de réinitialisation"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ paddingLeft: "40px" }}
                className="h-11 w-full rounded-full bg-[#f2f4f7] px-4 text-xs text-[#667085] outline-none placeholder:text-[#b4b9c5] focus:ring-2 focus:ring-[#d9f6f8]"
                required
              />
            </label>
          </div>
          <div className="w-3/4 self-center-safe">
            <label className="form-input-group relative">
              <FiLock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#46c6cb]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Entrer nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                style={{ paddingLeft: "40px" }}
                className="h-11 w-full rounded-full bg-[#f2f4f7] px-4 text-xs text-[#667085] outline-none placeholder:text-[#b4b9c5] focus:ring-2 focus:ring-[#d9f6f8]"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="text-[#46c6cb]" /> : <FiEye className="text-[#46c6cb]" />}
              </button>
            </label>
          </div>

          <div className="w-3/4 self-center-safe">
            <label className="form-input-group relative">
              <FiLock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#46c6cb]" />

              <input
               type={showPassword ? "text" : "password"}
                placeholder="Confirmer nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                style={{ paddingLeft: "40px" }}
                className="h-11 w-full rounded-full bg-[#f2f4f7] px-4 text-xs text-[#667085] outline-none placeholder:text-[#b4b9c5] focus:ring-2 focus:ring-[#d9f6f8]"
                required
              />
            </label>
          </div>
          <div className="flex flex-col justify-center items-center">
            <p className="text-center text-[#9aa3b2]">
              Le mot de passe doit contenir :
            </p>
            <ul className="px-4 text-[12px] text-[#9aa3b2] list-disc">
              <li>Au moins 6 caractères</li>
              <li>Au moins une lettre</li>
              <li>Au moins un chiffre</li>
            </ul>
          </div>
          {validationError && (
            <p className="text-center text-xs text-red-500">
              {validationError}
            </p>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              style={{ backgroundColor: COLORS.primary, marginTop: "-5px" }}
              className="submit-btn"
            >
              {resetPasswordMutation.isPending ? "Traitement..." : "Connexion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
