import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useConfirmEmail } from "@/features/auth/services/auth.service.ts";
import { Button, Card, CardContent, CardTitle } from "@/components/ui";
import Logo from "@/components/shared/Logo";

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
  }, [token]);

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
        <Card className="connexion-card">
          <CardContent className="flex flex-col items-center px-9 pb-9 pt-10 text-center">
            <div className="flex justify-center" style={{marginBottom: "20px"}} >
              <Logo alt="Jobty" className="h-12 w-auto" />
            </div>
            <div className=" flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100" style={{marginBottom: "20px"}}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6 text-cyan-600"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-.97 1.858l-7.5 5.25a2.25 2.25 0 0 1-2.56 0l-7.5-5.25a2.25 2.25 0 0 1-.97-1.858V6.75"
                />
              </svg>
            </div>

            <CardTitle style={{marginBottom: "10px"}} className="text-[32px] font-semibold tracking-tight text-slate-900">
              {content.title}
            </CardTitle>

            <div style={{ marginBottom: "20px" }} className="w-3/4" >
              <p style={{ marginBottom: "20px" }} className="text-base text-slate-500">{content.message}</p>

              <p style={{ marginBottom: "10px" }} className="text-sm leading-relaxed text-slate-400">
              {content.helper}
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
              {content.footer}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="default"
                onClick={() => navigate("/")}
                className="confirm-submit-btn h-11 rounded-full border-cyan-500 text-sm text-cyan-600 bg-[#3DC7C9]"
              >
                Allez à la page d’accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default EmailVerificationPage;
