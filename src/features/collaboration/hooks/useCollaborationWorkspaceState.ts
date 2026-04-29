import { useMemo, useState } from "react";
import { INITIAL_ETAPES } from "@/features/collaboration/constants/workflow";
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
  const [etapes, setEtapes] = useState<ProjectEtape[]>(INITIAL_ETAPES);
  const [contratAccepte, setContratAccepte] = useState<ContratAccepteState>(INITIAL_CONTRAT);
  const [paiementDepose, setPaiementDepose] = useState(false);
  const [modePaiement, setModePaiement] = useState("etapes");
  const [avis, setAvis] = useState<AvisState>(INITIAL_AVIS);

  const briefProgress = useMemo(() => {
    let progress = 0;
    if (brief.objectif) progress += 25;
    if (brief.livrables.length > 0) progress += 25;
    if (brief.delai) progress += 25;
    if (brief.budget) progress += 25;
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

  const updateEtapeStatut = (etapeId: number, statut: EtapeStatut) => {
    setEtapes((prev) =>
      prev.map((e) => (e.id === etapeId ? { ...e, statut } : e)),
    );
  };

  const livrerEtape = (etapeId: number) => {
    updateEtapeStatut(etapeId, "livree");
  };

  const validerEtape = (etapeId: number) => {
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

  const demanderModification = (etapeId: number) => {
    updateEtapeStatut(etapeId, "modification");
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
  };
};
