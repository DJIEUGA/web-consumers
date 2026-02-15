import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../features/auth/hooks/useAuthMutations";
import { useBackgroundProfileUpdate } from "../features/auth/hooks/useProfileUpdate";
import { useAuthStore } from "../stores/auth.store";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import { COLORS } from "../styles/colors";
import logo from "../assets/logo.png";
import "./connexion.css";

function Connexion() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const profileUpdateMutation = useBackgroundProfileUpdate();
  const authStore = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("freelance");
  const [signupStep, setSignupStep] = useState(1);

  // Map UI roles to API role enum
  const roleMapping = {
    freelance: "ROLE_PRO",
    entreprise: "ROLE_ENTERPRISE",
    client: "ROLE_CUSTOMER",
  };

  /**
   * Build profile update payload based on user role
   * Maps form data to the appropriate DTO for profile update
   */
  const buildProfileUpdateData = () => {
    const apiRole = roleMapping[selectedRole];

    if (apiRole === "ROLE_CUSTOMER") {
      // Standard profile for ROLE_CUSTOMER (Visiteur)
      return {
        role: apiRole,
        profileData: {
          // Only collect country, city for visiteur
          ...(signupData.pays && { country: signupData.pays }),
          ...(signupData.ville && { city: signupData.ville }),
        },
      };
    }

    if (apiRole === "ROLE_PRO") {
      // Pro profile for ROLE_PRO (Freelance)
      return {
        role: apiRole,
        profileData: {
          country: signupData.pays,
          city: signupData.ville,
          phoneNumber: signupData.telephone,
          bio: signupData.description,
          // specialite can be used as skills list
          skills: signupData.specialite ? [signupData.specialite] : [],
          // Additional fields like hourlyRate could be added to form later
        },
      };
    }

    if (apiRole === "ROLE_ENTERPRISE") {
      // Enterprise profile for ROLE_ENTERPRISE
      return {
        role: apiRole,
        profileData: {
          companyName: signupData.nomEntreprise,
          country: signupData.pays,
          city: signupData.ville,
          industry: signupData.secteur,
          description: signupData.description,
          // Additional fields like registrationNumber, websiteUrl could be added to form later
        },
      };
    }

    return null;
  };

  // États pour le formulaire de connexion
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // États pour le formulaire d'inscription
  const [signupData, setSignupData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    ville: "",
    pays: "",
    secteur: "",
    specialite: "",
    nomEntreprise: "",
    anneesExperience: "",
    description: "",
  });

  // Listes de pays africains
  const paysAfricains = [
    "Sénégal",
    "Côte d'Ivoire",
    "Mali",
    "Burkina Faso",
    "Niger",
    "Bénin",
    "Togo",
    "Ghana",
    "Nigeria",
    "Cameroun",
    "Gabon",
    "Congo",
    "RD Congo",
    "Tchad",
    "Guinée",
    "Guinée-Bissau",
    "Gambie",
    "Sierra Leone",
    "Liberia",
    "Maroc",
    "Algérie",
    "Tunisie",
    "Libye",
    "Mauritanie",
    "Égypte",
    "Soudan",
    "Éthiopie",
    "Kenya",
    "Tanzanie",
    "Ouganda",
    "Rwanda",
    "Burundi",
    "Somalie",
    "Djibouti",
    "Érythrée",
    "Angola",
    "Mozambique",
    "Zimbabwe",
    "Zambie",
    "Malawi",
    "Afrique du Sud",
    "Namibie",
    "Botswana",
    "Lesotho",
    "Eswatini",
    "Madagascar",
    "Maurice",
    "Comores",
    "Seychelles",
    "Cap-Vert",
  ];

  // Liste des secteurs d'activité
  const secteursActivite = [
    "Bâtiment & Travaux",
    "Électricité & Plomberie",
    "Informatique & Tech",
    "Design & Création",
    "Santé & Bien-être",
    "Éducation & Formation",
    "Commerce & Vente",
    "Transport & Logistique",
    "Agriculture",
    "Artisanat",
    "Juridique & Administratif",
    "Marketing & Communication",
    "Finance & Comptabilité",
    "Événementiel",
    "Restauration",
    "Mécanique & Automobile",
  ];

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    loginMutation.mutate(loginData, {
      onSuccess: (res) => {
        if (res?.success && res?.data) {
          // redirect based on role
          const redirect = authStore.getDashboardRoute(res.data.role);
          navigate(redirect);
        }
      },
      onError: (err) => {
        // Try to show server-provided message when available
        const serverMessage =
          err?.response?.message ||
          err?.response?.data?.message ||
          err?.message;
        console.error("Login failed error object:", err);
        alert(serverMessage || "Login failed. Please check your credentials.");
      },
    });
  };

  const handleSignupStep1Submit = (e) => {
    e.preventDefault();

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    if (signupData.password.length < 8) {
      alert("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    // Passer à l'étape 2 seulement pour freelance et entreprise
    if (selectedRole === "freelance" || selectedRole === "entreprise") {
      setSignupStep(2);
    } else {
      // Pour le porteur de projet/visiteur, inscription directe
      handleFinalSubmit();
    }
  };

  const handleSignupStep2Submit = (e) => {
    e.preventDefault();

    if (signupData.description.length < 50) {
      alert("La description doit contenir au moins 50 caractères");
      return;
    }

    handleFinalSubmit();
  };

  const handleFinalSubmit = () => {
    // Map form state to RegisterRequest payload
    const registrationPayload = {
      firstName: signupData.prenom,
      lastName: signupData.nom,
      email: signupData.email,
      password: signupData.password,
      role: roleMapping[selectedRole],
      // Add optional fields if they have values
      ...(signupData.pays && { country: signupData.pays }),
      ...(signupData.ville && { city: signupData.ville }),
    };

    console.log("Registration payload:", registrationPayload);

    registerMutation.mutate(registrationPayload, {
      onSuccess: (res) => {
        if (res?.success) {
          // Registration successful - show confirmation message
          alert(
            "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.",
          );

          // Trigger profile update in background (non-blocking)
          // Do NOT await this, just fire and forget
          const profileUpdateData = buildProfileUpdateData();
          if (
            profileUpdateData &&
            profileUpdateData.profileData &&
            Object.keys(profileUpdateData.profileData).length > 0
          ) {
            console.log(
              "Starting background profile update:",
              profileUpdateData,
            );
            profileUpdateMutation.mutate(profileUpdateData, {
              onSuccess: () => {
                console.log("Background profile update completed successfully");
              },
              onError: (err) => {
                // Error is already logged by the mutation hook
                console.warn(
                  "Background profile update failed (non-blocking):",
                  err,
                );
              },
            });
          }

          // Reset form and redirect to login
          setIsLogin(true);
          setSignupStep(1);
          setLoginData({ email: signupData.email, password: "" });
        }
      },
      onError: (err) => {
        // Show server-provided error message
        const serverMessage =
          err?.response?.message ||
          err?.response?.data?.message ||
          err?.message;
        console.error("Registration failed error object:", err);
        alert(serverMessage || "Registration failed. Please try again.");
      },
    });
  };

  const goBackToStep1 = () => {
    setSignupStep(1);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setSignupStep(1);
    setLoginData({ email: "", password: "" });
    setSignupData({
      nom: "",
      prenom: "",
      email: "",
      password: "",
      confirmPassword: "",
      telephone: "",
      ville: "",
      pays: "",
      secteur: "",
      specialite: "",
      nomEntreprise: "",
      anneesExperience: "",
      description: "",
    });
  };

  return (
    <div className="connexion-container">
      {/* Bouton retour */}
      <button className="back-button" onClick={() => navigate("/")}>
        <FiArrowLeft /> Retour à l'accueil
      </button>

      {/* Card principale */}
      <div className="connexion-card">
        {/* Logo */}
        <div className="connexion-logo">
          <img src={logo} alt="Jobty" />
        </div>

        {/* Titre */}
        <h1 className="connexion-title">
          <span className="title-prefix">
            {isLogin
              ? "Bon retour sur"
              : signupStep === 2
                ? "Complétez votre profil"
                : "Rejoignez"}
          </span>
          {signupStep === 1 && (
            <span style={{ color: COLORS.primary }}> Jobty</span>
          )}
        </h1>
        <p className="connexion-subtitle">
          {isLogin
            ? "Connectez-vous pour accéder à votre compte"
            : signupStep === 2
              ? "Quelques informations supplémentaires pour finaliser votre inscription"
              : "Créez votre compte et commencez votre aventure"}
        </p>

        {/* Toggle Connexion/Inscription (seulement à l'étape 1) */}
        {signupStep === 1 && (
          <div className="form-toggle">
            <button
              className={`toggle-btn ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
              style={isLogin ? { backgroundColor: COLORS.primary } : {}}
            >
              Connexion
            </button>
            <button
              className={`toggle-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
              style={!isLogin ? { backgroundColor: COLORS.primary } : {}}
            >
              Inscription
            </button>
          </div>
        )}

        {/* Formulaire de CONNEXION */}
        {isLogin ? (
          <form className="connexion-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">
                <FiMail /> Email
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="votre@email.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">
                <FiLock /> Mot de passe
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>
              <a href="/mot-de-passe-oublie" className="forgot-password">
                Mot de passe oublié ?
              </a>
            </div>

            <button
              type="submit"
              className="submit-btn"
              style={{ backgroundColor: COLORS.primary }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? "Connexion en cours..."
                : "Se connecter"}
            </button>
          </form>
        ) : (
          // Formulaire d'INSCRIPTION
          <>
            {/* ÉTAPE 1 : Informations de base */}
            {signupStep === 1 && (
              <>
                {/* Sélection du rôle */}
                <div className="role-selection">
                  <p className="role-label">Je suis :</p>
                  <div className="role-buttons">
                    <button
                      type="button"
                      className={`role-btn ${selectedRole === "freelance" ? "active" : ""}`}
                      onClick={() => setSelectedRole("freelance")}
                      style={
                        selectedRole === "freelance"
                          ? {
                              backgroundColor: COLORS.primary,
                              borderColor: COLORS.primary,
                            }
                          : {}
                      }
                    >
                      <FiUser />
                      Freelance
                    </button>
                    <button
                      type="button"
                      className={`role-btn ${selectedRole === "entreprise" ? "active" : ""}`}
                      onClick={() => setSelectedRole("entreprise")}
                      style={
                        selectedRole === "entreprise"
                          ? {
                              backgroundColor: COLORS.primary,
                              borderColor: COLORS.primary,
                            }
                          : {}
                      }
                    >
                      <FiBriefcase />
                      Entreprise
                    </button>
                    <button
                      type="button"
                      className={`role-btn ${selectedRole === "client" ? "active" : ""}`}
                      onClick={() => setSelectedRole("client")}
                      style={
                        selectedRole === "client"
                          ? {
                              backgroundColor: COLORS.primary,
                              borderColor: COLORS.primary,
                            }
                          : {}
                      }
                    >
                      <FiUser />
                      Visiteur
                    </button>
                  </div>
                </div>

                <form
                  className="connexion-form"
                  onSubmit={handleSignupStep1Submit}
                >
                  {/* Nom et Prénom */}
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nom">
                        <FiUser /> Nom
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        placeholder="Votre nom"
                        value={signupData.nom}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="prenom">
                        <FiUser /> Prénom
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        placeholder="Votre prénom"
                        value={signupData.prenom}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="signup-email">
                      <FiMail /> Email
                    </label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      placeholder="votre@email.com"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  {/* Pays et Ville pour PORTEUR DE PROJET uniquement */}
                  {selectedRole === "client" && (
                    <>
                      {/* Pays avec select */}
                      <div className="form-group">
                        <label htmlFor="pays-client">
                          <FiMapPin /> Pays
                        </label>
                        <select
                          id="pays-client"
                          name="pays"
                          value={signupData.pays}
                          onChange={handleSignupChange}
                          required
                        >
                          <option value="">Sélectionnez votre pays</option>
                          {paysAfricains.map((pays, index) => (
                            <option key={index} value={pays}>
                              {pays}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ville */}
                      <div className="form-group">
                        <label htmlFor="ville-client">
                          <FiMapPin /> Ville
                        </label>
                        <input
                          type="text"
                          id="ville-client"
                          name="ville"
                          placeholder="Dakar"
                          value={signupData.ville}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Mot de passe */}
                  <div className="form-group">
                    <label htmlFor="signup-password">
                      <FiLock /> Mot de passe
                    </label>
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="signup-password"
                        name="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <small className="input-hint">Minimum 8 caractères</small>
                  </div>

                  {/* Confirmation mot de passe */}
                  <div className="form-group">
                    <label htmlFor="confirm-password">
                      <FiLock /> Confirmer le mot de passe
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirm-password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  {/* Conditions d'utilisation */}
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" required />
                      <span>
                        J'accepte les{" "}
                        <a href="/conditions" style={{ color: COLORS.primary }}>
                          conditions d'utilisation
                        </a>{" "}
                        et la{" "}
                        <a
                          href="/confidentialite"
                          style={{ color: COLORS.primary }}
                        >
                          politique de confidentialité
                        </a>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    style={{ backgroundColor: COLORS.primary }}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Inscription en cours..."
                      : selectedRole === "client"
                        ? "Créer mon compte"
                        : "Continuer"}
                    {!registerMutation.isPending &&
                      (selectedRole === "freelance" ||
                        selectedRole === "entreprise") && (
                        <FiArrowRight style={{ marginLeft: "8px" }} />
                      )}
                  </button>
                </form>
              </>
            )}

            {/* ÉTAPE 2 : Compléter le profil (Freelance/Entreprise uniquement) */}
            {signupStep === 2 && (
              <>
                <button
                  className="back-step-button"
                  onClick={goBackToStep1}
                  type="button"
                >
                  <FiArrowLeft /> Retour
                </button>

                <form
                  className="connexion-form"
                  onSubmit={handleSignupStep2Submit}
                >
                  {/* Téléphone */}
                  <div className="form-group">
                    <label htmlFor="telephone">
                      <FiPhone /> Téléphone
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      placeholder="+221 XX XXX XX XX"
                      value={signupData.telephone}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  {/* Pays avec select */}
                  <div className="form-group">
                    <label htmlFor="pays">
                      <FiMapPin /> Pays
                    </label>
                    <select
                      id="pays"
                      name="pays"
                      value={signupData.pays}
                      onChange={handleSignupChange}
                      required
                    >
                      <option value="">Sélectionnez votre pays</option>
                      {paysAfricains.map((pays, index) => (
                        <option key={index} value={pays}>
                          {pays}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ville */}
                  <div className="form-group">
                    <label htmlFor="ville">
                      <FiMapPin /> Ville
                    </label>
                    <input
                      type="text"
                      id="ville"
                      name="ville"
                      placeholder="Dakar"
                      value={signupData.ville}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  {/* Nom de l'entreprise (uniquement pour entreprise) */}
                  {selectedRole === "entreprise" && (
                    <div className="form-group">
                      <label htmlFor="nomEntreprise">
                        <FiBriefcase /> Nom de l'entreprise
                      </label>
                      <input
                        type="text"
                        id="nomEntreprise"
                        name="nomEntreprise"
                        placeholder="Nom de votre entreprise"
                        value={signupData.nomEntreprise}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  )}

                  {/* Secteur d'activité avec select */}
                  <div className="form-group">
                    <label htmlFor="secteur">
                      <FiBriefcase /> Secteur d'activité
                    </label>
                    <select
                      id="secteur"
                      name="secteur"
                      value={signupData.secteur}
                      onChange={handleSignupChange}
                      required
                    >
                      <option value="">Sélectionnez votre secteur</option>
                      {secteursActivite.map((secteur, index) => (
                        <option key={index} value={secteur}>
                          {secteur}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Spécialité */}
                  <div className="form-group">
                    <label htmlFor="specialite">
                      <FiBriefcase /> Spécialité
                    </label>
                    <input
                      type="text"
                      id="specialite"
                      name="specialite"
                      placeholder={
                        selectedRole === "freelance"
                          ? "Ex: Développeur Full-Stack"
                          : "Ex: Construction de bâtiments"
                      }
                      value={signupData.specialite}
                      onChange={handleSignupChange}
                      required
                    />
                    <small className="input-hint">
                      Précisez votre spécialité dans le secteur{" "}
                      {signupData.secteur || "sélectionné"}
                    </small>
                  </div>

                  {/* Années d'expérience/exercice */}
                  <div className="form-group">
                    <label htmlFor="anneesExperience">
                      <FiCalendar />{" "}
                      {selectedRole === "freelance"
                        ? "Années d'expérience"
                        : "Années d'exercice"}
                    </label>
                    <input
                      type="number"
                      id="anneesExperience"
                      name="anneesExperience"
                      placeholder="Ex: 5"
                      min="0"
                      max="50"
                      value={signupData.anneesExperience}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  {/* Description/Bio */}
                  <div className="form-group">
                    <label htmlFor="description">
                      <FiFileText />{" "}
                      {selectedRole === "freelance"
                        ? "Bio / Présentation"
                        : "Description de l'entreprise"}
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder={
                        selectedRole === "freelance"
                          ? "Présentez-vous brièvement, vos compétences, votre parcours..."
                          : "Décrivez votre entreprise, vos services, votre mission..."
                      }
                      rows={4}
                      value={signupData.description}
                      onChange={handleSignupChange}
                      required
                      minLength={50}
                    />
                    <small className="input-hint">
                      Minimum 50 caractères ({signupData.description.length}/50)
                    </small>
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    style={{ backgroundColor: COLORS.primary }}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Inscription en cours..."
                      : "Créer mon compte"}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {/* Lien pour basculer (seulement à l'étape 1) */}
        {signupStep === 1 && (
          <p className="toggle-link">
            {isLogin
              ? "Vous n'avez pas de compte ?"
              : "Vous avez déjà un compte ?"}
            <button onClick={toggleForm} style={{ color: COLORS.primary }}>
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Connexion;
