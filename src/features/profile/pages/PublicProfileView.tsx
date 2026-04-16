import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { usePublicProfile } from '@/features/profile/hooks/useProfileActions';

type PublicProfileViewProps = {
  profileId?: string;
};

const formatPrice = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return 'Sur devis';
  }

  return `${value.toLocaleString('fr-FR')} FCFA/h`;
};

const formatRating = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return value.toFixed(1);
};

const PublicProfileView = ({ profileId }: PublicProfileViewProps) => {
  const params = useParams<{ id: string }>();
  const resolvedProfileId = profileId || params.id;

  const { data, isPending, isError, error } = usePublicProfile(resolvedProfileId);
  const profile = data?.data;

  const profileName = useMemo(() => {
    const fullName = [profile?.firstName, profile?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || profile?.displayName || 'Professionnel Jobty';
  }, [profile?.displayName, profile?.firstName, profile?.lastName]);

  const profileLocation = useMemo(() => {
    const city = profile?.location?.city;
    const country = profile?.location?.country;
    const label = [city, country].filter(Boolean).join(', ');
    return label || 'Localisation non renseignée';
  }, [profile?.location?.city, profile?.location?.country]);

  const services = profile?.services || [];
  const portfolio = profile?.portfolio || [];
  const reviews = profile?.reviews || [];

  if (!resolvedProfileId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil introuvable</CardTitle>
          <CardDescription>ID de profil manquant.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement du profil…</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (isError || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impossible de charger le profil</CardTitle>
          <CardDescription>
            {error?.message || 'Une erreur est survenue lors du chargement du profil.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{profileName}</CardTitle>
          <CardDescription>{profile?.headline || profile?.bio || 'Profil public'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          <p>
            <span className="font-medium text-slate-900">Localisation :</span> {profileLocation}
          </p>
          <p>
            <span className="font-medium text-slate-900">Tarif :</span> {formatPrice(profile?.hourlyRate)}
          </p>
          <p>
            <span className="font-medium text-slate-900">Note moyenne :</span>{' '}
            {formatRating(profile?.averageRating)}
          </p>
          <p>
            <span className="font-medium text-slate-900">Avis :</span> {profile?.reviewCount ?? 0}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>{services.length} service(s) proposé(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun service publié.</p>
          ) : (
            services.map((service) => (
              <div key={service.id} className="rounded-lg border border-zinc-200 p-4">
                <h3 className="font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{service.description || 'Sans description.'}</p>
                <p className="mt-2 text-sm font-medium text-indigo-600">
                  {formatPrice(service.price)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>{portfolio.length} réalisation(s)</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.length === 0 ? (
            <p className="text-sm text-slate-500">Aucune réalisation publiée.</p>
          ) : (
            portfolio.map((item) => (
              <article key={item.id} className="rounded-lg border border-zinc-200 p-3">
                <h3 className="font-medium text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {item.description || 'Sans description.'}
                </p>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avis clients</CardTitle>
          <CardDescription>{reviews.length} avis reçu(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun avis pour le moment.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Note: {formatRating(review.rating)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {review.comment || 'Aucun commentaire.'}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicProfileView;
