import { useEffect, useMemo } from 'react';
import { useAuthStore, type User } from '@/stores/auth.store';
import { useProfileQuery } from '@/features/profile/hooks/useProfileMutations';

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const getProfilePayload = (profile: unknown): Record<string, unknown> => {
  if (!profile || typeof profile !== 'object') return {};
  const levelOne = (profile as Record<string, unknown>).data ?? profile;
  if (!levelOne || typeof levelOne !== 'object') return {};
  const levelTwo = (levelOne as Record<string, unknown>).data ?? levelOne;
  return (levelTwo as Record<string, unknown>) || {};
};

const mapProfileToUser = (
  payload: Record<string, unknown>,
  fallback: User | null,
  fallbackRole: string | null,
): User | null => {
  const nestedUser =
    payload.user && typeof payload.user === 'object'
      ? (payload.user as Record<string, unknown>)
      : {};

  const id =
    toStringValue(payload.userId) ||
    toStringValue(payload.id) ||
    toStringValue(nestedUser.id) ||
    toStringValue(fallback?.id);

  const email =
    toStringValue(nestedUser.email) ||
    toStringValue(payload.email) ||
    toStringValue(fallback?.email);

  const role =
    toStringValue(nestedUser.role) ||
    toStringValue(payload.role) ||
    toStringValue(fallback?.role) ||
    toStringValue(fallbackRole);

  if (!id || !email || !role) return fallback;

  return {
    id,
    email,
    role: role as User['role'],
    firstName:
      toStringValue(nestedUser.firstName) ||
      toStringValue(payload.firstName) ||
      toStringValue(payload.prenom) ||
      fallback?.firstName ||
      undefined,
    lastName:
      toStringValue(nestedUser.lastName) ||
      toStringValue(payload.lastName) ||
      toStringValue(payload.nom) ||
      fallback?.lastName ||
      undefined,
    avatar:
      toStringValue(payload.avatarUrl) ||
      toStringValue(payload.avatar) ||
      toStringValue(nestedUser.avatarUrl) ||
      toStringValue(nestedUser.avatar) ||
      fallback?.avatar ||
      undefined,
  };
};

const areUsersEqual = (a: User | null, b: User | null): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.id === b.id &&
    a.email === b.email &&
    a.role === b.role &&
    (a.firstName || '') === (b.firstName || '') &&
    (a.lastName || '') === (b.lastName || '') &&
    (a.avatar || '') === (b.avatar || '')
  );
};

export const useAuthProfileSync = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);

  const { data: profileData } = useProfileQuery({
    enabled: isHydrated && isAuthenticated,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryKey: ['profile', 'current'],
  });

  const mappedUser = useMemo(() => {
    const payload = getProfilePayload(profileData);
    return mapProfileToUser(payload, user, role);
  }, [profileData, role, user]);

  useEffect(() => {
    if (!isAuthenticated || !mappedUser) return;

    if (!areUsersEqual(user, mappedUser)) {
      setUser(mappedUser);
    }

    if (mappedUser.role && mappedUser.role !== role) {
      setRole(mappedUser.role);
    }
  }, [isAuthenticated, mappedUser, role, setRole, setUser, user]);
};

export default useAuthProfileSync;