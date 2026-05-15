import { useMemo, useState } from "react";
import type { AvisState, BriefState, ContratAccepteState, EtapeStatut, ProjectEtape } from "@/features/collaboration/types/workflow";

const INITIAL_BRIEF: BriefState = {
  objectif: "",
  livrables: [],
  delai: "",
  budget: "",
  fichiers: [],
  commentairePro: "",
};

const INITIAL_CONTRAT: ContratAccepteState = {
  porteur: false,
  freelance: false,
};

const INITIAL_AVIS: AvisState = {
  note: 0,
  commentaire: "",
  recommande: null,
};

type UseCollaborationWorkspaceStateArgs = {
  onAdvanceStep: (step: number, reason: string, delayMs?: number) => void;
};

export const useCollaborationWorkspaceState = ({
  onAdvanceStep,
}: UseCollaborationWorkspaceStateArgs) => {
  const [brief, setBrief] = useState<BriefState>(INITIAL_BRIEF);
  const [etapes, setEtapes] = useState<ProjectEtape[]>([]);
  const [contratAccepte, setContratAccepte] = useState<ContratAccepteState>(INITIAL_CONTRAT);
  const [paiementDepose, setPaiementDepose] = useState(false);
  const [modePaiement, setModePaiement] = useState("etapes");
  const [avis, setAvis] = useState<AvisState>(INITIAL_AVIS);

  const briefProgress = useMemo(() => {
    let progress = 0;
    if (brief.objectif.trim()) progress += 25;
    if (brief.livrables.length > 0) progress += 25;
    if (brief.delai.trim()) progress += 25;
    if (Number(brief.budget) > 0) progress += 25;
    return progress;
  }, [brief]);

  const toggleLivrable = (livrable: string) => {
    setBrief((prev) => {
      if (prev.livrables.includes(livrable)) {
        return {
          ...prev,
          livrables: prev.livrables.filter((l) => l !== livrable),
        };
      }

      return { ...prev, livrables: [...prev.livrables, livrable] };
    });
  };

  const accepterContrat = (partie: keyof ContratAccepteState) => {
    setContratAccepte((prev) => {
      const next = { ...prev, [partie]: true };
      if (next.porteur && next.freelance) {
        onAdvanceStep(5, "contract_signed", 1000);
      }
      return next;
    });
  };

  const deposerPaiement = () => {
    setPaiementDepose(true);
    onAdvanceStep(6, "payment_deposited", 2000);
  };

  const updateEtapeStatut = (etapeId: string, statut: EtapeStatut) => {
    setEtapes((prev) =>
      prev.map((e) => (e.id === etapeId ? { ...e, statut } : e)),
    );
  };

  const livrerEtape = (etapeId: string) => {
    updateEtapeStatut(etapeId, "livree");
  };

  const validerEtape = (etapeId: string) => {
    setEtapes((prev) => {
      const nextEtapes = prev.map((e) =>
        e.id === etapeId ? { ...e, statut: "validee" as const } : e,
      );
      if (nextEtapes.every((e) => e.statut === "validee")) {
        onAdvanceStep(9, "all_milestones_validated", 1500);
      }
      return nextEtapes;
    });
  };

  const demanderModification = (etapeId: string) => {
    updateEtapeStatut(etapeId, "modification");
  };

  const initEtapesFromBrief = (livrables: string[], budget: string) => {
    if (livrables.length === 0) return;
    const total = Number(budget) || 0;
    const perEtape = livrables.length > 0 ? Math.round(total / livrables.length) : 0;
    setEtapes(
      livrables.map((titre, index) => ({
        id: String(index + 1),
        titre,
        statut: index === 0 ? ("en_cours" as const) : ("a_venir" as const),
        montant: perEtape,
        progression: 0,
      })),
    );
  };

  return {
    brief,
    setBrief,
    briefProgress,
    etapes,
    setEtapes,
    contratAccepte,
    setContratAccepte,
    paiementDepose,
    setPaiementDepose,
    modePaiement,
    setModePaiement,
    avis,
    setAvis,
    toggleLivrable,
    accepterContrat,
    deposerPaiement,
    livrerEtape,
    validerEtape,
    demanderModification,
    initEtapesFromBrief,
  };
};
