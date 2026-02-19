import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiCamera, FiX, FiTrash2, FiLock, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import {
  useDeleteAccountMutation,
  useProfileQuery,
  useUpdateEnterpriseProfileMutation,
  useUpdateProProfileMutation,
  useUpdateProfileMutation,
  useUpdateStandardProfileMutation,
  useUploadAvatarMutation,
} from '../../features/profile/hooks/useProfileMutations';
import './ProfileDrawer.css';

type ProfileFormState = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  country: string;
  city: string;
  sector: string;
  specialization: string;
  experienceYears: string;
  phoneNumber: string;
  description: string;
  skills: string;
  hourlyRate: string;
  averageRating: string;
  avatarUrl: string;
};

const emptyForm: ProfileFormState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  country: '',
  city: '',
  sector: '',
  specialization: '',
  experienceYears: '',
  phoneNumber: '',
  description: '',
  skills: '',
  hourlyRate: '',
  averageRating: '',
  avatarUrl: '',
};

/**
 * Safely extracts the profile payload from nested response structure
 * Handles both ApiResponse wrapper and direct data
 */
const getProfilePayload = (profile: unknown): Record<string, unknown> => {
  if (!profile) return {};
  const dataLevel = (profile as any)?.data ?? profile;
  return (dataLevel as any)?.data ?? dataLevel;
};

/**
 * Converts any value to string safely, handling null/undefined
 */
const toStringValue = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

/**
 * Transforms raw profile data to form state
 * Normalizes field names from different API versions
 * Handles nested user object from API response
 */
const transformProfileToForm = (payload: Record<string, unknown>): ProfileFormState => {
  if (!payload || Object.keys(payload).length === 0) {
    return emptyForm;
  }

  // Extract nested user object if present (API returns user data in nested structure)
  const user = (payload.user as Record<string, unknown>) || {};

  return {
    firstName: toStringValue(user.firstName ?? payload.firstName ?? payload.prenom),
    lastName: toStringValue(user.lastName ?? payload.lastName ?? payload.nom),
    username: toStringValue(user.username ?? payload.username ?? payload.pseudo),
    email: toStringValue(user.email ?? payload.email),
    country: toStringValue(payload.country ?? payload.pays),
    city: toStringValue(payload.city ?? payload.ville),
    sector: toStringValue(payload.sector ?? payload.secteur),
    specialization: toStringValue(payload.specialization ?? payload.specialite),
    experienceYears: toStringValue(payload.experienceYears ?? payload.anneeExperience),
    phoneNumber: toStringValue(user.phoneNumber ?? payload.phoneNumber ?? payload.telephone),
    description: toStringValue(payload.description ?? payload.bio),
    skills: Array.isArray(payload.skills)
      ? payload.skills.join(', ')
      : toStringValue(payload.skills),
    hourlyRate: toStringValue(payload.hourlyRate ?? payload.tarifHoraire),
    averageRating: toStringValue(payload.averageRating ?? payload.noteMoyenne),
    avatarUrl: toStringValue(payload.avatarUrl ?? payload.avatar),
  };
};

const ProfileDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  
  // Only fetch profile when drawer is open to avoid unnecessary API calls
  const { data: profileData, isLoading } = useProfileQuery({
      enabled: open,
      queryKey: []
  });
  
  const updateProfileMutation = useUpdateProfileMutation();
  const updateStandardProfileMutation = useUpdateStandardProfileMutation();
  const updateProProfileMutation = useUpdateProProfileMutation();
  const updateEnterpriseProfileMutation = useUpdateEnterpriseProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [deletePassword, setDeletePassword] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const hasInitializedRef = useRef(false);

  /**
   * Memoized payload extraction to prevent unnecessary transformations
   */
  const payload = useMemo(
    () => getProfilePayload(profileData),
    [profileData]
  );

  /**
   * Memoized form transformation to update only when payload changes
   */
  const transformedForm = useMemo(
    () => transformProfileToForm(payload),
    [payload]
  );

  /**
   * Initialize form once when profile data is first loaded
   * Using ref to avoid redundant syncs after drawer close/reopen
   */
  useEffect(() => {
    if (!profileData || !open) return;

    if (!hasInitializedRef.current) {
      console.log('🔍 ProfileDrawer - Raw API data:', profileData);
      console.log('🔍 ProfileDrawer - Extracted payload:', payload);
      console.log('🔍 ProfileDrawer - Transformed form:', transformedForm);
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(transformedForm);
      hasInitializedRef.current = true;
    }
  }, [profileData, open, transformedForm, payload]);

  /**
   * Handle form field changes
   * Memoized to prevent unnecessary re-renders of child components
   */
  const handleChange = useCallback(
    (key: keyof ProfileFormState, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /**
   * Generate avatar using DiceBear API
   * Uses first/last name or username as seed for consistency
   */
  const handleGenerateAvatar = useCallback(() => {
    const seed = [form.firstName, form.lastName, form.username]
      .filter(Boolean)
      .join('-') || 'jobty-user';
    const generated = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      seed,
    )}`;
    setForm((prev) => ({ ...prev, avatarUrl: generated }));
  }, [form.firstName, form.lastName, form.username]);

  /**
   * Handle avatar file upload
   * Updates form state with avatar URL from API response
   */
  const handleUploadAvatar = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      uploadAvatarMutation.mutate(file, {
        onSuccess: (data) => {
          const updated = getProfilePayload(data);
          if (updated?.avatarUrl || updated?.avatar) {
            setForm((prev) => ({
              ...prev,
              avatarUrl: toStringValue(updated.avatarUrl ?? updated.avatar),
            }));
          }
        },
      });
    },
    [uploadAvatarMutation]
  );

  /**
   * Submit profile updates based on user role
   * Different mutation functions for different role types
   */
  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      const basePayload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        country: form.country,
        city: form.city,
        phoneNumber: form.phoneNumber,
        description: form.description,
        bio: form.description,
        sector: form.sector,
        specialization: form.specialization,
        experienceYears: form.experienceYears
          ? Number(form.experienceYears)
          : undefined,
        avatarUrl: form.avatarUrl,
      };

      if (role === 'ROLE_PRO') {
        updateProProfileMutation.mutate({
          ...basePayload,
          skills: form.skills
            ? form.skills.split(',').map((item) => item.trim()).filter(Boolean)
            : [],
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        });
        return;
      }

      if (role === 'ROLE_CUSTOMER') {
        updateStandardProfileMutation.mutate(basePayload);
        return;
      }

      if (role === 'ROLE_ENTERPRISE') {
        updateEnterpriseProfileMutation.mutate(basePayload);
        return;
      }

      updateProfileMutation.mutate(basePayload);
    },
    [
      form,
      role,
      updateProfileMutation,
      updateProProfileMutation,
      updateStandardProfileMutation,
      updateEnterpriseProfileMutation,
    ]
  );

  /**
   * Delete account with password confirmation
   * Clears all session data on successful deletion
   */
  const handleDeleteAccount = useCallback(() => {
    if (!deletePassword) return;

    deleteAccountMutation.mutate(deletePassword, {
      onSuccess: () => {
        navigate('/');
      },
    });
  }, [deletePassword, deleteAccountMutation, navigate]);

  /**
   * Handle password change
   */
  const handlePasswordChange = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    // TODO: Call password change mutation
    console.log('Password change:', passwordForm);
    alert('Fonctionnalité de changement de mot de passe à implémenter');
  }, [passwordForm]);

  /**
   * Handle drawer close - reset editing state
   */
  const handleClose = useCallback(() => {
    setDeletePassword('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    hasInitializedRef.current = false; // Reset initialization flag for next open
    onClose();
  }, [onClose]);

  return (
    <div className={`profile-drawer-root ${open ? 'open' : ''}`}>
      <div className="profile-drawer-overlay" onClick={handleClose} />
      <aside className="profile-drawer">
        <div className="profile-drawer-header">
          <div>
            <p className="profile-drawer-eyebrow">Profil</p>
            <h2>{payload?.isVerified ? 'Vos informations' : 'Completez vos informations'}</h2>
            <p className="profile-drawer-subtitle">
              {payload?.isVerified
              ? 'Gerez et mettez a jour vos donnees personnelles'
              : 'Pour finaliser la creation de votre compte'}
            </p>
          </div>
          <button className="profile-drawer-close" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="profile-drawer-tabs">
          <button
            type="button"
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Informations
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Securite
          </button>
        </div>

        {activeTab === 'profile' && (
        <form className="profile-drawer-card" onSubmit={handleSubmit}>
          <div className="profile-drawer-avatar">
            <button
              type="button"
              className="profile-avatar-generate"
              onClick={handleGenerateAvatar}
            >
              Generer votre avatar
            </button>
            <div className="profile-avatar-preview">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" />
              ) : (
                <FiCamera />
              )}
            </div>
            <label className="profile-avatar-upload">
              <input type="file" accept="image/*" onChange={handleUploadAvatar} />
              <span>Televerser</span>
            </label>
            {uploadAvatarMutation.isPending && (
              <span className="profile-avatar-status">Mise a jour...</span>
            )}
          </div>

          <div className="profile-drawer-grid">
            <div className="profile-field">
              <label>Nom &amp; prenom</label>
              <input
                type="text"
                value={`${form.firstName} ${form.lastName}`.trim()}
                onChange={(event) => {
                  const [first = '', ...rest] = event.target.value.split(' ');
                  handleChange('firstName', first);
                  handleChange('lastName', rest.join(' '));
                }}
                placeholder="Nom complet"
              />
            </div>
            <div className="profile-field">
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                value={form.username}
                onChange={(event) => handleChange('username', event.target.value)}
                placeholder="@pseudo"
              />
            </div>
            <div className="profile-field">
              <label>Adresse courriel</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="nom@domaine.com"
              />
            </div>
            <div className="profile-field">
              <label>Pays</label>
              <input
                type="text"
                value={form.country}
                onChange={(event) => handleChange('country', event.target.value)}
                placeholder="Pays"
              />
            </div>
            <div className="profile-field">
              <label>Ville</label>
              <input
                type="text"
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder="Ville"
              />
            </div>
            <div className="profile-field">
              <label>Secteur d'activite</label>
              <input
                type="text"
                value={form.sector}
                onChange={(event) => handleChange('sector', event.target.value)}
                placeholder="Secteur"
              />
            </div>
            <div className="profile-field">
              <label>Specialisation</label>
              <input
                type="text"
                value={form.specialization}
                onChange={(event) =>
                  handleChange('specialization', event.target.value)
                }
                placeholder="Specialisation"
              />
            </div>
            <div className="profile-field">
              <label>Annee d'experience</label>
              <input
                type="number"
                value={form.experienceYears}
                onChange={(event) =>
                  handleChange('experienceYears', event.target.value)
                }
                placeholder="0"
              />
            </div>
            <div className="profile-field">
              <label>Telephone</label>
              <input
                type="text"
                value={form.phoneNumber}
                onChange={(event) => handleChange('phoneNumber', event.target.value)}
                placeholder="+000 00 00 00 00"
              />
            </div>
            {role === 'ROLE_PRO' && (
              <>
                <div className="profile-field">
                  <label>Competences (tags)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(event) => handleChange('skills', event.target.value)}
                    placeholder="UI, UX, Branding"
                  />
                </div>
                <div className="profile-field">
                  <label>Tarif horaire</label>
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={(event) => handleChange('hourlyRate', event.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="profile-field">
                  <label>Note moyenne</label>
                  <input type="text" value={form.averageRating} readOnly />
                </div>
              </>
            )}
            <div className="profile-field profile-field-full">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder="Parlez de votre profil"
              />
            </div>
          </div>

          <div className="profile-drawer-actions">
            <button
              className="profile-save-btn"
              type="submit"
              disabled={
                updateProfileMutation.isPending ||
                updateProProfileMutation.isPending ||
                updateStandardProfileMutation.isPending ||
                updateEnterpriseProfileMutation.isPending
              }
            >
              {isLoading ? 'Chargement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
        )}

        {activeTab === 'security' && (
        <div className="profile-drawer-card security-card">
          <div className="security-card-icon">
            <div className="security-icon-badge">
              <FiShield />
            </div>
          </div>
          
          <div className="security-card-content">
            <div className="security-card-header">
              <h3>Securite du compte</h3>
              <p>Gerez votre mot de passe et la securite de votre compte</p>
            </div>

            {/* Password Change Section */}
            <div className="security-section">
              <div className="security-section-header">
                <FiLock className="section-icon" />
                <div>
                  <h4>Changer le mot de passe</h4>
                  <p>Assurez-vous d'utiliser un mot de passe fort et unique</p>
                </div>
              </div>
              
              <form className="security-form" onSubmit={handlePasswordChange}>
                <div className="profile-field">
                  <label>Mot de passe actuel</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Entrez votre mot de passe actuel"
                    required
                  />
                </div>
                
                <div className="profile-field">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Entrez un nouveau mot de passe"
                    required
                    minLength={8}
                  />
                </div>
                
                <div className="profile-field">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirmez le nouveau mot de passe"
                    required
                    minLength={8}
                  />
                </div>
                
                <button type="submit" className="profile-save-btn">
                  <FiLock /><span>Mettre a jour</span>
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="security-section security-danger">
              <div className="security-section-header">
                <FiAlertTriangle className="section-icon danger-icon" />
                <div>
                  <h4>Zone dangereuse</h4>
                  <p>Actions irreversibles sur votre compte</p>
                </div>
              </div>
              
              <div className="danger-zone-content">
                <div className="danger-info">
                  <h5>Supprimer le compte</h5>
                  <p>Cette action est definitive et supprimera toutes vos donnees. Entrez votre mot de passe pour confirmer.</p>
                </div>
                
                <div className="danger-actions">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    placeholder="Mot de passe"
                    className="danger-input"
                  />
                  <button
                    type="button"
                    className="danger-delete-btn"
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                  >
                    <FiTrash2 /> {deleteAccountMutation.isPending ? 'Suppression...' : 'Supprimer definitivement'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </aside>
    </div>
  );
};

export default ProfileDrawer;
