# Jobty - Plateforme SaaS (Frontend)

Bienvenue sur le dépôt du frontend de **Jobty**, une plateforme SaaS professionnelle orientée B2B.

## 🚀 Présentation

Ce projet est une application web monopage (SPA) et une Progressive Web App (PWA) développée avec **React** et **Vite**. L'application propose une expérience utilisateur fluide pour la mise en relation entre freelances et entreprises, incluant des fonctionnalités de découverte géolocalisée et de gestion de profil.

## 🛠️ Stack Technique

- **Framework :** React + Vite
- **Styling :** Tailwind CSS + Shadcn UI (Thème Indigo/Zinc)
- **Gestion d'état :** Zustand (Global/UI) + TanStack Query (Server state/Appels API)
- **Routage :** React Router
- **Cartographie :** Mapbox GL / Leaflet
- **Formulaires :** React Hook Form
- **PWA :** Service Worker + Manifest web

## 🏗️ Architecture du Projet

L'application suit une architecture modulaire stricte basée sur les domaines métier (`src/features/`) :
- `auth/` : Flux d'authentification et d'inscription
- `discovery/` & `marketplace/` : Recherche, landing pages et listes de professionnels
- `localisation/` : Carte interactive et recherche géospatiale
- `dashboard/`, `portfolio/`, `profile/` : Gestion de l'espace utilisateur

## 💻 Commandes de Développement

- `npm install` : Installer les dépendances du projet
- `npm run dev` : Démarrer le serveur de développement avec rechargement à chaud (HMR)
- `npm run build` : Compiler le projet de manière optimisée pour la production
- `npm run preview` : Prévisualiser le build de production en local
- `npm run lint` : Lancer l'analyse statique du code (ESLint)
