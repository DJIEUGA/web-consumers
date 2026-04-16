import React from "react";
import { FiMap, FiMapPin } from "react-icons/fi";

/**
 * Admin Map Tab
 * Location analytics and geographic distribution of users/projects
 */
const MapTab: React.FC = () => {
  // TODO: Integrate Mapbox GL for actual map visualization
  // TODO: Replace with useAdminMapDataQuery() hook

  const locationStats = [
    { city: "Abidjan", users: 245, projects: 89 },
    { city: "Yamoussoukro", users: 87, projects: 32 },
    { city: "Bouaké", users: 56, projects: 18 },
    { city: "Daloa", users: 34, projects: 12 },
  ];

  return (
    <div className="admin-map">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Carte des localisations
      </h2>

      {/* Map Placeholder */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-6">
        <div className="bg-zinc-100 rounded-xl flex items-center justify-center h-96">
          <div className="text-center">
            <FiMap className="mx-auto text-zinc-400 mb-4" size={64} />
            <p className="text-slate-500 font-medium mb-2">
              Carte interactive à intégrer
            </p>
            <p className="text-sm text-slate-400">
              Intégration Mapbox GL en cours pour visualiser la distribution
              géographique
            </p>
          </div>
        </div>
      </div>

      {/* Location Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Statistiques par localisation
        </h3>
        <div className="space-y-3">
          {locationStats.map((location, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FiMapPin className="text-indigo-600" size={20} />
                <span className="font-medium text-slate-900">
                  {location.city}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-slate-500">Utilisateurs: </span>
                  <span className="font-semibold text-slate-900">
                    {location.users}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Projets: </span>
                  <span className="font-semibold text-slate-900">
                    {location.projects}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapTab;
