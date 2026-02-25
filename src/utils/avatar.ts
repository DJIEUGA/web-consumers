type AvatarCandidate = {
  avatar?: unknown;
  avatarUrl?: unknown;
  id?: unknown;
  userId?: unknown;
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
};

const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value).trim();

export const buildAvatarFallbackUrl = (seed: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'jobty-user')}`;

export const resolveAvatarUrl = (
  candidate?: AvatarCandidate | null,
  seedOverride?: string,
): string => {
  const avatar = toStringValue(candidate?.avatar);
  const avatarUrl = toStringValue(candidate?.avatarUrl);

  if (avatar) return avatar;
  if (avatarUrl) return avatarUrl;

  const seed =
    toStringValue(seedOverride) ||
    [
      toStringValue(candidate?.id) || toStringValue(candidate?.userId),
      toStringValue(candidate?.email),
      [toStringValue(candidate?.firstName), toStringValue(candidate?.lastName)]
        .filter(Boolean)
        .join('-'),
    ]
      .filter(Boolean)
      .join('-') ||
    'jobty-user';

  return buildAvatarFallbackUrl(seed);
};

export default resolveAvatarUrl;