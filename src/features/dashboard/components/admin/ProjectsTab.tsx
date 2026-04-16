import React from "react";
import { FiBriefcase, FiClock, FiCheckCircle } from "react-icons/fi";

/**
 * Admin Projects Management Tab
 * Monitor and manage all platform projects
 */
const ProjectsTab: React.FC = () => {
  // TODO: Replace with useAdminProjectsQuery() hook
  const projects = [
    {
      id: 1,
      title: "Développement site e-commerce",
      client: "Jean Dupont",
      pro: "Marie Martin",
      status: "EN_COURS",
      budget: 5000,
      deadline: "2026-04-15",
    },
    {
      id: 2,
      title: "Design application mobile",
      client: "Sophie Laurent",
      pro: "Thomas Petit",
      status: "TERMINE",
      budget: 3500,
      deadline: "2026-02-20",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_COURS":
        return <FiClock className="text-blue-600" />;
      case "TERMINE":
        return <FiCheckCircle className="text-green-600" />;
      default:
        return <FiBriefcase className="text-zinc-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EN_COURS":
        return "bg-blue-100 text-blue-700";
      case "TERMINE":
        return "bg-green-100 text-green-700";
      case "ANNULE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <div className="admin-projects">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Gestion des projets
      </h2>

      {/* Projects Grid */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="text-2xl mt-1">{getStatusIcon(project.status)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {project.title}
                  </h3>
                  <div className="space-y-1 text-sm text-slate-500">
                    <p>
                      <span className="font-medium">Client:</span> {project.client}
                    </p>
                    <p>
                      <span className="font-medium">Professionnel:</span>{" "}
                      {project.pro}
                    </p>
                    <p>
                      <span className="font-medium">Budget:</span>{" "}
                      {project.budget.toLocaleString()} €
                    </p>
                    <p>
                      <span className="font-medium">Échéance:</span>{" "}
                      {project.deadline}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    project.status
                  )}`}
                >
                  {project.status.replace("_", " ")}
                </span>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  Voir détails
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
          <FiBriefcase className="mx-auto text-zinc-300 mb-4" size={48} />
          <p className="text-slate-500">Aucun projet à afficher</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
