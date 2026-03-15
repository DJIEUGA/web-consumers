export interface ResolvedLocation {
  country: string;
  city: string;
}

const toText = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value).trim();

export const readLocationFromUser = (user: unknown): ResolvedLocation | null => {
  if (!user || typeof user !== 'object') return null;

  const source = user as Record<string, unknown>;
  const country =
    toText(source.country) ||
    toText(source.pays) ||
    toText(source.locationCountry);
  const city =
    toText(source.city) ||
    toText(source.ville) ||
    toText(source.locationCity);

  if (!country || !city) return null;

  return { country, city };
};

const reverseGeocode = async (latitude: number, longitude: number): Promise<ResolvedLocation | null> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) return null;

  const data = await response.json();
  const address = data?.address ?? {};
  const country = toText(address.country);
  const city =
    toText(address.city) ||
    toText(address.town) ||
    toText(address.village) ||
    toText(address.county);

  if (!country || !city) return null;

  return { country, city };
};

const geolocate = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 6000,
      },
    );
  });
};

export const resolveCurrentLocation = async (user?: unknown): Promise<ResolvedLocation | null> => {
  const fromUser = readLocationFromUser(user);
  if (fromUser) return fromUser;

  const coordinates = await geolocate();
  if (!coordinates) return null;

  try {
    return await reverseGeocode(coordinates.latitude, coordinates.longitude);
  } catch {
    return null;
  }
};
