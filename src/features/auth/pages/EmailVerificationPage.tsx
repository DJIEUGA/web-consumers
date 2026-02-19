import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useConfirmEmail } from '@/features/auth/services/auth.service.ts';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const confirmMutation = useConfirmEmail();

  useEffect(() => {
    if (!token) {
      return;
    }

    confirmMutation.mutate(token);
  }, [confirmMutation, token]);

  if (!token) {
    return (
      <div className="mx-auto mt-16 max-w-xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Lien invalide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Le token de confirmation est manquant ou invalide.
            </p>
            <Button onClick={() => navigate('/connexion')}>Retour à la connexion</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Confirmation de compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {confirmMutation.isPending && (
            <p className="text-sm text-slate-600">Validation de votre email en cours...</p>
          )}

          {confirmMutation.isError && (
            <p className="text-sm text-red-600">
              {confirmMutation.error?.message ||
                'Impossible de confirmer votre email. Réessayez plus tard.'}
            </p>
          )}

          {confirmMutation.isSuccess && (
            <p className="text-sm text-emerald-600">
              {confirmMutation.data?.message ||
                'Votre email a bien été confirmé. Vous pouvez maintenant vous connecter.'}
            </p>
          )}

          <Button onClick={() => navigate('/connexion')}>Aller à la connexion</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationPage;
