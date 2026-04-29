import { FiAward, FiCheck, FiEdit3, FiFile, FiList, FiLock, FiMessageCircle, FiTarget, FiUnlock, FiUpload } from "react-icons/fi";
import { FaHandshake } from "react-icons/fa";
import type { IconType } from "react-icons";
import type { CollaborationActor, CollaborationAction, CollaborationStage, ProjectEtape, StageActionRules, StepToStageMap } from "@/features/collaboration/types/workflow";

export const COLLAB_STORAGE_PREFIX = "jobty:collaboration:room:";

export const LIVRABLES_SUGGESTIONS = [
  "Maquette graphique",
  "Code source",
  "Documentation",
  "Formation/Tutoriel",
  "Fichiers sources (PSD, AI...)",
  "Révisions incluses",
  "Support post-livraison",
];

export const INITIAL_ETAPES: ProjectEtape[] = [
  {
    id: 1,
    titre: "Maquette initiale",
    statut: "en_cours",
    montant: 50000,
    progression: 65,
  },
  {
    id: 2,
    titre: "Développement",
    statut: "a_venir",
    montant: 100000,
    progression: 0,
  },
  {
    id: 3,
    titre: "Tests & Livraison",
    statut: "a_venir",
    montant: 50000,
    progression: 0,
  },
];

export const STEP_TO_STAGE: StepToStageMap = {
  0: "CONTACT",
  1: "DECISION",
  2: "MATCH",
  3: "BRIEF",
  4: "CONTRACT",
  5: "PAYMENT",
  6: "EXECUTION",
  7: "DELIVERY",
  8: "RELEASE",
  9: "CLOSURE",
};

export const STAGE_ACTION_RULES: StageActionRules = {
  CONTACT: {
    propose: ["customer"],
  },
  DECISION: {
    accept: ["pro"],
    request_info: ["pro"],
    decline: ["pro"],
  },
  MATCH: {
    open_brief: ["customer"],
  },
};

export const PROCESS_STEPS: Array<{
  num: number;
  label: string;
  icon: IconType;
}> = [
  { num: 0, label: "Prise de contact", icon: FiMessageCircle },
  { num: 1, label: "Décision", icon: FiCheck },
  { num: 2, label: "Match confirmé", icon: FaHandshake },
  { num: 3, label: "Brief", icon: FiEdit3 },
  { num: 4, label: "Contrat", icon: FiFile },
  { num: 5, label: "Paiement", icon: FiLock },
  { num: 6, label: "Collaboration", icon: FiTarget },
  { num: 7, label: "Livraison", icon: FiUpload },
  { num: 8, label: "Paiement libéré", icon: FiUnlock },
  { num: 9, label: "Clôture", icon: FiAward },
];

export const canActorPerformAction = (
  action: CollaborationAction,
  actor: CollaborationActor,
  stage: CollaborationStage,
) => {
  const allowedActors = STAGE_ACTION_RULES[stage]?.[action];
  if (!allowedActors || allowedActors.length === 0) return true;
  return allowedActors.includes(actor);
};
