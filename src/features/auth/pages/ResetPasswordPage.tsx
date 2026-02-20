import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useResetPassword } from '@/features/auth/services/auth.service';
import logo from '@/assets/logo.png';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPasswordMutation = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isTokenMissing = useMemo(() => token.trim().length === 0, [token]);

  useEffect(() => {
    if (!resetPasswordMutation.isSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      navigate('/connexion');
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate, resetPasswordMutation.isSuccess]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isTokenMissing) {
      setValidationError('Le lien est invalide ou expiré.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas.');
      return;
    }

    setValidationError(null);
    resetPasswordMutation.mutate(
      { token, password },
      {
        onSuccess: () => {
          setPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eaf3f5] px-4 py-8">
      <div
        className="max-w-full rounded-4xl border border-[#e8eaef] bg-[#f7f7f8] px-6 pb-7 pt-7 shadow-[0_6px_14px_rgba(15,23,42,0.06)]"
        style={{ width: '469px', height: '507px' }}
      >
        <div className="flex h-full flex-col">
        <div className="mt-2 mb-7 flex justify-center">
          <img src={logo} alt="Jobty" className="h-11 w-auto" />
        </div>

        <h1 className="mb-3 text-center text-[18px] font-semibold leading-tight text-[#101828]">
          Nouveau mot de passe
        </h1>

        <p className="mx-auto mb-5 max-w-64 text-center text-[12px] leading-normal text-[#a0a8b8]">
          Entrez votre nouveau mot de passe pour finaliser la réinitialisation
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="h-11 w-full rounded-full border border-transparent bg-[#ececef] px-4 text-[12px] text-[#667085] outline-none placeholder:text-[#b4b9c5] focus:border-[#b9edf0] focus:ring-2 focus:ring-[#d9f6f8]"
            required
          />

          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="h-11 w-full rounded-full border border-transparent bg-[#ececef] px-4 text-[12px] text-[#667085] outline-none placeholder:text-[#b4b9c5] focus:border-[#b9edf0] focus:ring-2 focus:ring-[#d9f6f8]"
            required
          />

          {validationError && <p className="text-center text-xs text-red-500">{validationError}</p>}

          {isTokenMissing && !validationError && (
            <p className="text-center text-xs text-red-500">Le token de réinitialisation est manquant.</p>
          )}

          <div className="flex justify-center pt-1">
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || isTokenMissing}
              className="h-10 min-w-52 rounded-full bg-[#39c2c8] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#2db3b9] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resetPasswordMutation.isPending ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => navigate('/connexion')}
          className="mt-4 w-full text-center text-[11px] text-[#9aa3b2] transition-colors hover:text-[#667085]"
        >
          Retour à la connexion
        </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
