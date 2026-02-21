import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useForgotPassword } from "@/features/auth/services/auth.service";
import logo from "@/assets/logo.png";

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
          <img src={logo} alt="Jobty" className="h-11 w-auto" />
        </div>

        <h1 className="connexion-title">Mot de passe oublié</h1>

        <p className="connexion-subtitle text-center text-[12px] leading-normal text-[#a0a8b8]">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>

        <form onSubmit={handleSubmit} className="connexion-form">
          <div className="form-group w-3/4 self-center-safe">
          <label className="form-group-input">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#46c6cb]"
              aria-hidden="true"
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
              style={{ paddingLeft: "40px" }}
              className="w-full rounded-full border border-transparent bg-[#ececef] text-[12px] text-[#667085] outline-none placeholder:text-[#b4b9c5] focus:border-[#b9edf0] focus:ring-2 focus:ring-[#d9f6f8]"
              required
            />
            </label>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="submit-btn min-w-40 rounded-full bg-[#39c2c8] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#2db3b9] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {forgotPasswordMutation.isPending
                ? "Envoi en cours..."
                : "Envoyer le lien"}
            </button>
          </div>
        </form>
        <button
          type="button"
          onClick={() => navigate("/connexion")}
          className="px-5 text-[15px] w-full text-center text-[#9aa3b2] transition-colors cursor-pointer hover:text-[#667085]"
          style={{ marginTop: "15px" }}
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
