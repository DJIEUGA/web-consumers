import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNotification } from "../../../hooks/useNotification";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../hooks/useAuthMutations";
import { useBackgroundProfileUpdate } from "../hooks/useProfileUpdate";
import { useAuthStore } from "../../../stores/auth.store";
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
  FiChevronDown,
  FiCamera,
  FiX,
} from "react-icons/fi";
import { COLORS } from "../../../styles/colors";
import Logo from "@/components/shared/Logo";
import "../styles/Connexion.css";

export const Connexion = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notify = useNotification();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const profileUpdateMutation = useBackgroundProfileUpdate();
  const authStore = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("freelance");
  const [signupStep, setSignupStep] = useState<number>(1);

  // Map UI roles to API role enum
  const roleMapping = {
    freelance: "ROLE_PRO",
    entreprise: "ROLE_ENTERPRISE",
    client: "ROLE_CUSTOMER",
  };

  const extractErrorMessage = (error: any, fallback: string) => {
    if (error?.response?.message) return error.response.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    if (typeof error === "string") return error;
    return fallback;
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
          ...(signupData.country && { country: signupData.country }),
          ...(signupData.city && { city: signupData.city }),
        },
      };
    }

    if (apiRole === "ROLE_PRO") {
      // Pro profile for ROLE_PRO (Freelance)
      return {
        role: apiRole,
        profileData: {
          country: signupData.country,
          city: signupData.city,
          phoneNumber: signupData.phoneNumber,
          bio: signupData.bio,
          skills: signupData.specialization ? [signupData.specialization] : [],
          sector: signupData.sector,
          experienceYears: signupData.experienceYears,
          specialization: signupData.specialization

        },
      };
    }

    if (apiRole === "ROLE_ENTERPRISE") {
      // Enterprise profile for ROLE_ENTERPRISE
      return {
        role: apiRole,
        profileData: {
          companyName: signupData.companyName,
          country: signupData.country,
          city: signupData.city,
          sector: signupData.sector,
          bio: signupData.bio,
          phoneNumber: signupData.phoneNumber,
          experienceYears: signupData.experienceYears,
          specialization: signupData.specialization
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
    lastName: "",
    firstName: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    city: "",
    country: "",
    sector: "",
    specialization: "",
    companyName: "",
    username: "",
    experienceYears: "",
    bio: "",
    tags: [] as string[],
    acceptTerms: false,
  });

  const [currentTag, setCurrentTag] = useState("");

  // États pour les listes déroulantes personnalisées
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleSelectOption = (name: string, value: string) => {
    setSignupData({ ...signupData, [name]: value });
    setActiveDropdown(null);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!signupData.tags.includes(currentTag.trim())) {
        setSignupData({
          ...signupData,
          tags: [...signupData.tags, currentTag.trim()]
        });
      }
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSignupData({
      ...signupData,
      tags: signupData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Fermer les dropdowns lors d'un clic ailleurs
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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

  const handleSignupStep1Submit = (e) => {
    e.preventDefault();

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      notify.error(
        "Erreur de validation",
        "Les mots de passe ne correspondent pas",
        {
          duration: 4000,
        },
      );
      return;
    }

    if (signupData.password.length < 8) {
      notify.error(
        "Erreur de validation",
        "Le mot de passe doit contenir au moins 8 caractères",
        {
          duration: 4000,
        },
      );
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

    if (signupData.bio.length < 50) {
      notify.error(
        "Erreur de validation",
        "La description doit contenir au moins 50 caractères",
        {
          duration: 4000,
        },
      );
      return;
    }

    handleFinalSubmit();
  };

  const handleFinalSubmit = () => {
    // Map form state to RegisterRequest payload
    const registrationPayload = {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      gender: signupData.gender as "MALE" | "FEMALE",
      email: signupData.email,
      password: signupData.password,
      role: roleMapping[selectedRole],
      // Add optional fields if they have values
      ...(signupData.country && { country: signupData.country }),
      ...(signupData.city && { city: signupData.city }),
      ...(signupData.phoneNumber && { phoneNumber: signupData.phoneNumber }),
      ...(signupData.sector && { sector: signupData.sector }),
      ...(signupData.tags.length > 0 ? { skills: signupData.tags } : (signupData.specialization ? { skills: [signupData.specialization] } : {})),
      ...(signupData.specialization && { specialization: signupData.specialization}),
      ...(signupData.companyName && { companyName: signupData.companyName }),
      ...(signupData.username && { username: signupData.username }),
      ...(signupData.experienceYears && { experienceYears: signupData.experienceYears }),
      ...(signupData.bio && { bio: signupData.bio }),
    };

    registerMutation.mutate(registrationPayload, {
      onSuccess: (res) => {
        if (res?.success) {
          // Registration successful - show confirmation message
          notify.success(
            "Inscription réussie!",
            "Vous pouvez maintenant vous connecter à votre compte.",
            {
              duration: 5000,
            },
          );

          // Reset form and return to login view
          setIsLogin(true);
          setSignupStep(1);
          setLoginData({ email: signupData.email, password: "" });
        }
      },
      onError: (err) => {
        const serverMessage = extractErrorMessage(err, "Veuillez réessayer");
        notify.error(
          "Inscription échouée",
          serverMessage,
          {
            duration: 5000,
          },
        );
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
      firstName: "",
      lastName: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      city: "",
      country: "",
      sector: "",
      specialization: "",
      companyName: "",
      username: "",
      experienceYears: "",
      bio: "",
      tags: [],
      acceptTerms: false,
    });
  };

  return (
    <div className="connexion-container">
      {/* Bouton retour */}
      <button className="back-button" onClick={() => navigate("/")}>
        <FiArrowLeft /> Retour à l'accueil
      </button>

      {/* Card principale */}
      <div className={`connexion-card ${signupStep === 2 ? 'step2-active' : ''}`}>
        {/* Logo - Hidden in Step 2 */}
        {signupStep !== 2 && (
          <div className="connexion-logo">
            <Logo alt="Jobty" />
          </div>
        )}
        
        {/* Titre - Hidden in Step 2 */}
        {signupStep !== 2 && (
          <>
            <h1 className="connexion-title">
              {isLogin ? "Bon retour sur Jobty" : "Rejoignez Jobty"}
            </h1>
            <p className="connexion-subtitle">
              {isLogin
                ? "Connectez vous pour accéder à votre compte"
                : "Créez votre compte et commencez votre aventure"}
            </p>
          </>
        )}

        {/* Formulaire de CONNEXION */}
        {isLogin ? (
          <form
            className="connexion-form"
            onSubmit={(e) => {
              e.preventDefault();

              if (loginMutation.isPending) {
                return;
              }

              loginMutation.mutate(loginData, {
                onSuccess: (res) => {
                  if (res?.success && res?.data) {
                    // Save token and user to auth store
                    authStore.login(res.data.role, res.data.token, res.data);

                    // Show success notification
                    notify.success('Connexion réussie', 'Bienvenue! Redirection en cours...', {
                      duration: 2000,
                    });

                    // Wait for toast to display, then redirect
                    setTimeout(() => {
                      const redirectUrl = searchParams.get("redirect");
                      const redirect =
                        redirectUrl || authStore.getPostLoginRoute(res.data.role);
                      navigate(redirect);
                    }, 500); // 2.5s is a bit long, let's keep it faster so users aren't waiting on empty screens
                  } else {
                    notify.error('Erreur', 'Réponse du serveur inattendue', {
                      duration: 5000,
                    });
                  }
                },
                onError: (err) => {
                  const errorMessage = extractErrorMessage(
                    err,
                    "Vérifiez vos identifiants",
                  );

                  // Show error notification
                  notify.error("Échec de la connexion", errorMessage, {
                    duration: 5000,
                  });
                },
              });
            }}
          >
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon-left" />
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  placeholder="E-mail"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="input-wrapper">
                <FiLock className="input-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  placeholder="Mot de passe"
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

            <button
              type="submit"
              className="submit-btn"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? "Connexion..."
                : "Connexion"}
            </button>

            <div className="forgot-password-container">
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={() => navigate("/forgot-password")}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div className="signup-prompt">
              Vous n'avez pas de compte ? 
              <button type="button" className="signup-link" onClick={toggleForm}>
                S'inscrire
              </button>
            </div>
          </form>
        ) : (
          // Formulaire d'INSCRIPTION
          <>
            {/* ÉTAPE 1 : Informations de base */}
            {signupStep === 1 && (
              <>
                {/* Sélection du rôle */}
                {/* Sélection du rôle (Style Minimal Mockup) */}
                <div className="role-selection-minimal">
                  <div 
                    className={`role-item ${selectedRole === "freelance" ? "active" : ""}`}
                    onClick={() => setSelectedRole("freelance")}
                  >
                    <div className="role-checkbox">
                      <div className="role-checkbox-inner" />
                    </div>
                    <span>Freelance</span>
                  </div>
                  
                  <div 
                    className={`role-item ${selectedRole === "entreprise" ? "active" : ""}`}
                    onClick={() => setSelectedRole("entreprise")}
                  >
                    <div className="role-checkbox">
                      <div className="role-checkbox-inner" />
                    </div>
                    <span>Entreprise</span>
                  </div>

                  <div 
                    className={`role-item ${selectedRole === "client" ? "active" : ""}`}
                    onClick={() => setSelectedRole("client")}
                  >
                    <div className="role-checkbox">
                      <div className="role-checkbox-inner" />
                    </div>
                    <span>Porteur de projet</span>
                  </div>
                </div>

                <form
                  className="connexion-form"
                  onSubmit={handleSignupStep1Submit}
                >
                  {/* Nom et Prénom en une ligne */}
                  <div className="form-row">
                    <div className="form-group">
                      <div className="input-wrapper">
                        <FiUser className="input-icon-left" />
                        <input
                          type="text"
                          id="nom"
                          name="lastName"
                          placeholder="Nom"
                          value={signupData.lastName}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="input-wrapper">
                        <FiUser className="input-icon-left" />
                        <input
                          type="text"
                          id="prenom"
                          name="firstName"
                          placeholder="Prénom"
                          value={signupData.firstName}
                          onChange={handleSignupChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Genre Custom Dropdown */}
                  <div className="form-group">
                    <div className="input-wrapper" onClick={(e) => { e.stopPropagation(); toggleDropdown('gender'); }}>
                      <FiUser className="input-icon-left" />
                      <div className={`custom-select-trigger ${signupData.gender ? 'has-value' : ''}`}>
                        {signupData.gender === 'MALE' ? 'Homme' : signupData.gender === 'FEMALE' ? 'Femme' : 'Genre'}
                      </div>
                      <FiChevronDown className="select-arrow-icon" />
                      
                      {activeDropdown === 'gender' && (
                        <div className="custom-dropdown-list">
                          <div className="dropdown-option" onClick={() => handleSelectOption('gender', 'MALE')}>Homme</div>
                          <div className="dropdown-option" onClick={() => handleSelectOption('gender', 'FEMALE')}>Femme</div>
                        </div>
                      )}
                    </div>
                    {/* Hidden input for form validity if needed, but here we use state */}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <div className="input-wrapper">
                      <FiMail className="input-icon-left" />
                      <input
                        type="email"
                        id="signup-email"
                        name="email"
                        placeholder="E-mail"
                        value={signupData.email}
                        onChange={handleSignupChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Pays et Ville pour PORTEUR DE PROJET uniquement */}
                  {selectedRole === "client" && (
                    <>
                      {/* Pays Custom Dropdown */}
                      <div className="form-group">
                        <div className="input-wrapper" onClick={(e) => { e.stopPropagation(); toggleDropdown('country'); }}>
                          <FiMapPin className="input-icon-left" />
                          <div className={`custom-select-trigger ${signupData.country ? 'has-value' : ''}`}>
                            {signupData.country || 'Sélectionnez votre pays'}
                          </div>
                          <FiChevronDown className="select-arrow-icon" />

                          {activeDropdown === 'country' && (
                            <div className="custom-dropdown-list">
                              {paysAfricains.map((country, index) => (
                                <div 
                                  key={index} 
                                  className="dropdown-option" 
                                  onClick={() => handleSelectOption('country', country)}
                                >
                                  {country}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ville */}
                      <div className="form-group">
                        <div className="input-wrapper">
                          <FiMapPin className="input-icon-left" />
                          <input
                            type="text"
                            id="ville-client"
                            name="city"
                            placeholder="Ville"
                            value={signupData.city}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Mot de passe */}
                  <div className="form-group">
                    <div className="input-wrapper">
                      <FiLock className="input-icon-left" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="signup-password"
                        name="password"
                        placeholder="Mot de passe"
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
                  </div>

                  {/* Confirmation mot de passe */}
                  <div className="form-group">
                    <div className="input-wrapper">
                      <FiLock className="input-icon-left" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirmPassword"
                        placeholder="Confirmer Mot de passe"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
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

                  {/* Conditions d'utilisation (Mockup style) */}
                  <div 
                    className="terms-container"
                    onClick={() => {
                      const checkbox = document.getElementById('terms-checkbox-real') as HTMLInputElement;
                      if (checkbox) checkbox.click();
                    }}
                  >
                    <div className={`terms-checkbox ${signupData.acceptTerms ? 'active' : ''}`}>
                      <div className="terms-checkbox-inner" />
                    </div>
                    <input 
                      type="checkbox" 
                      id="terms-checkbox-real"
                      style={{ display: 'none' }}
                      checked={signupData.acceptTerms}
                      onChange={(e) => setSignupData({ ...signupData, acceptTerms: e.target.checked })}
                      required 
                    />
                    <span className="terms-text">
                      J'accepte les <a href="/conditions">conditions d'utilisation</a> et la <a href="/confidentialite">politique de confidentialité</a>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? "Inscription..."
                      : "Créer compte"}
                  </button>

                  <div className="auth-redirect-prompt">
                    Vous avez déjà un compte ? 
                    <button type="button" className="auth-redirect-link" onClick={() => setIsLogin(true)}>
                      Se connecter
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ÉTAPE 2 : Compléter le profil (Freelance/Entreprise uniquement) */}
            {signupStep === 2 && (
              <div className="step2-container">
                <div className="step2-header-text">
                  <h2 className="connexion-title">Complétez vos informations</h2>
                  <p className="connexion-subtitle">pour finaliser la création de votre compte</p>
                </div>

                <form className="step2-form" onSubmit={handleSignupStep2Submit}>
                  <div className="step2-main-content">
                    {/* Colonne Gauche : Avatar */}
                    <div className="avatar-section">
                      <button type="button" className="generate-avatar-btn">Générez votre avatar</button>
                      <div className="avatar-placeholder">
                        <FiCamera />
                      </div>
                    </div>

                    {/* Colonne Milieu : Infos déjà saisies (Lecture seule / Résumé) */}
                    <div className="info-display-grid">
                      <div className="info-block">
                        <span className="info-label">Nom & prenom</span>
                        <span className="info-value">{signupData.firstName} {signupData.lastName}</span>
                      </div>

                      <div className="info-block">
                        <span className="info-label">Adresse courriel</span>
                        <span className="info-value email">{signupData.email}</span>
                      </div>

                      <div className="info-block">
                        <span className="info-label">Secteur d'activité <FiChevronDown className="info-label-icon" /></span>
                        <div className="input-wrapper" onClick={(e) => { e.stopPropagation(); toggleDropdown('sector'); }}>
                          <div className={`custom-select-trigger ${signupData.sector ? 'has-value' : ''}`}>
                            {signupData.sector || 'Secteur d\'activité'}
                          </div>
                          {activeDropdown === 'sector' && (
                            <div className="custom-dropdown-list">
                              {secteursActivite.map((sector, index) => (
                                <div key={index} className="dropdown-option" onClick={() => handleSelectOption('sector', sector)}>
                                  {sector}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="info-block">
                        <span className="info-label">
                          {selectedRole === "freelance" ? "Année d'expérience" : "Année d'exercice"}
                        </span>
                        <div className="input-wrapper">
                          <input 
                            type="number" 
                            name="experienceYears"
                            placeholder="5 ans" 
                            value={signupData.experienceYears}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="info-block">
                        <span className="info-label">Téléphone</span>
                        <div className="input-wrapper">
                          <input 
                            type="tel" 
                            name="phoneNumber"
                            placeholder="+237 680 45 89 65" 
                            value={signupData.phoneNumber}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colonne Droite : Nouvelles infos */}
                    <div className="info-display-grid">
                      <div className="info-block">
                        <span className="info-label">
                          {selectedRole === "freelance" ? "Nom d'utilisateur" : "Nom de l'entreprise"}
                        </span>
                        <div className="input-wrapper">
                          <input 
                            type="text" 
                            name={selectedRole === "freelance" ? "username" : "companyName"}
                            placeholder={selectedRole === "freelance" ? "@Olstudio" : "Nom de l'entreprise"} 
                            value={selectedRole === "freelance" ? signupData.username : signupData.companyName}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ gap: '15px' }}>
                        <div className="info-block" style={{ flex: 1 }}>
                          <span className="info-label">Pays <FiChevronDown className="info-label-icon" /></span>
                          <div className="input-wrapper" onClick={(e) => { e.stopPropagation(); toggleDropdown('country_step2'); }}>
                            <div className={`custom-select-trigger ${signupData.country ? 'has-value' : ''}`}>
                              {signupData.country || 'Cameroun'}
                            </div>
                            {activeDropdown === 'country_step2' && (
                              <div className="custom-dropdown-list">
                                {paysAfricains.map((country, index) => (
                                  <div key={index} className="dropdown-option" onClick={() => handleSelectOption('country', country)}>
                                    {country}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="info-block" style={{ flex: 1 }}>
                          <span className="info-label">Ville <FiChevronDown className="info-label-icon" /></span>
                          <div className="input-wrapper">
                            <input 
                              type="text" 
                              name="city"
                              placeholder="Yaoundé" 
                              value={signupData.city}
                              onChange={handleSignupChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="info-block">
                        <span className="info-label">Spécialisation</span>
                        <div className="input-wrapper">
                          <input 
                            type="text" 
                            name="specialization"
                            placeholder="Brand design" 
                            value={signupData.specialization}
                            onChange={handleSignupChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="info-block">
                        <span className="info-label">Tag métier</span>
                        <div className="input-wrapper">
                          <input 
                            type="text" 
                            placeholder="Tapez un tag et appuyez sur Entrée" 
                            value={currentTag}
                            onChange={(e) => setCurrentTag(e.target.value)}
                            onKeyDown={handleAddTag}
                          />
                        </div>
                        <div className="tags-container">
                          {signupData.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="tag-chip"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag}
                              <FiX className="tag-remove-icon" />
                            </span>
                          ))}
                          {signupData.tags.length === 0 && !currentTag && (
                            <span className="tag-chip" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Ex: Logo design</span>
                          )}
                        </div>
                      </div>

                      <div className="info-block">
                        <span className="info-label">Description</span>
                        <div className="step2-description-box">
                          <textarea 
                            name="bio"
                            placeholder="Présentez-vous brièvement..."
                            value={signupData.bio}
                            onChange={handleSignupChange}
                            required
                            minLength={50}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="step2-bottom">
                    <div className="step2-submit-container">
                      <button 
                        type="submit" 
                        className="step2-submit-btn"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Enregistrement..." : selectedRole === "entreprise" ? "Enregistrer" : "Créer mon compte"}
                      </button>
                    </div>
                  </div>
                </form>

                <button
                  className="back-step-button"
                  onClick={goBackToStep1}
                  type="button"
                  style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                >
                  <FiArrowLeft /> Retour à l'étape précédente
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
