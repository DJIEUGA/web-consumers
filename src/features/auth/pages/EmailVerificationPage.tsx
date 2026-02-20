import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useConfirmEmail } from '@/features/auth/services/auth.service.ts';
import { Button, Card, CardContent, CardTitle } from '@/components/ui';
import logo from '@/assets/logo.png';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const confirmMutation = useConfirmEmail();
  const hasToken = Boolean(token);

  useEffect(() => {
    if (!token) {
      return;
    }

    confirmMutation.mutate(token);
  }, [confirmMutation, token]);

  const getContent = () => {
    if (!hasToken) {
      return {
        title: 'Vérifiez votre e-mail',
        message: 'Un email de confirmation a été envoyé à votre adresse.',
        helper:
          "Cliquez sur le lien dans l'email pour activer votre compte et commencer à générer du contenu.",
        footer: 'Si vous ne trouvez pas l’email, vérifiez votre dossier spam ou courrier indésirable.',
      };
    }

    if (confirmMutation.isPending) {
      return {
        title: 'Vérification en cours',
        message: 'Nous validons votre e-mail en ce moment.',
        helper: 'Veuillez patienter quelques secondes pendant la confirmation.',
        footer: 'Vous serez redirigé ensuite vers votre espace.',
      };
    }

    if (confirmMutation.isSuccess) {
      return {
        title: 'Adresse confirmée',
        message: confirmMutation.data?.message || 'Votre e-mail a été confirmé avec succès.',
        helper: 'Votre compte est maintenant actif.',
        footer: 'Vous pouvez continuer et accéder à votre espace.',
      };
    }

    return {
      title: 'Lien invalide',
      message:
        confirmMutation.error?.message ||
        'Impossible de confirmer votre e-mail avec ce lien.',
      helper: 'Le lien peut être expiré ou déjà utilisé.',
      footer: 'Essayez de demander un nouvel email de confirmation.',
    };
  };

  const content = getContent();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img src={logo} alt="Jobty" className="h-12 w-auto" />
        </div>

        <Card className="rounded-3xl border-zinc-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center px-9 pb-9 pt-10 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6 text-cyan-600"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-.97 1.858l-7.5 5.25a2.25 2.25 0 0 1-2.56 0l-7.5-5.25a2.25 2.25 0 0 1-.97-1.858V6.75" />
              </svg>
            </div>

            <CardTitle className="mb-2 text-[32px] font-semibold tracking-tight text-slate-900">
              {content.title}
            </CardTitle>

            <p className="mb-4 text-base text-slate-500">{content.message}</p>

            <p className="mb-3 text-sm leading-relaxed text-slate-400">{content.helper}</p>
            <p className="mb-8 text-xs leading-relaxed text-slate-400">{content.footer}</p>

            <div className="w-full space-y-3">
              <Button
                onClick={() => navigate('/')}
                className="h-11 w-full rounded-full bg-cyan-500 text-sm text-white hover:bg-cyan-600"
              >
                Allez à la page d’accueil
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="h-11 w-full rounded-full border-cyan-500 text-sm text-cyan-600 hover:bg-cyan-50"
              >
                Allez à la page d’accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
