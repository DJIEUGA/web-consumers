# Profile Feature Module

Handles all user profile management, including profile viewing, editing, avatar upload, KYC verification, and password management.

## Structure

```
src/features/profile/
├── components/        # UI components (ProfileCard, KycUpload, etc.)
├── hooks/            # TanStack Query hooks (useProfileQuery, etc.)
├── services/         # API service functions (profileApi.js)
├── stores/           # Local Zustand stores (if needed)
├── types/            # JSDoc type definitions
└── README.md         # This file
```

## Quick Start

### Query User Profile

```jsx
import { useProfileQuery } from '../hooks/useProfileMutations';

export default function MyProfile() {
  const { data: profile, isLoading, error } = useProfileQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{profile.data.firstName} {profile.data.lastName}</h1>
      <img src={profile.data.avatar} alt="Avatar" />
      <p>{profile.data.bio}</p>
    </div>
  );
}
```

### Update Profile

```jsx
import { useUpdateProfileMutation } from '../hooks/useProfileMutations';
import { useForm } from 'react-hook-form';

export default function EditProfile() {
  const updateMutation = useUpdateProfileMutation();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        alert('Profile updated!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="First Name" />
      <input {...register('lastName')} placeholder="Last Name" />
      <input {...register('bio')} placeholder="Bio" />
      <button disabled={updateMutation.isPending}>
        {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
      </button>
      {updateMutation.isError && (
        <p style={{ color: 'red' }}>{updateMutation.error?.message}</p>
      )}
    </form>
  );
}
```

### Upload Avatar

```jsx
import { useUploadAvatarMutation } from '../hooks/useProfileMutations';

export default function AvatarUpload() {
  const uploadMutation = useUploadAvatarMutation();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file, {
        onSuccess: () => {
          alert('Avatar updated!');
        },
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploadMutation.isPending}
      />
      {uploadMutation.isPending && <p>Uploading...</p>}
      {uploadMutation.isError && (
        <p style={{ color: 'red' }}>{uploadMutation.error?.message}</p>
      )}
    </div>
  );
}
```

### Upload KYC Documents

```jsx
import { useUploadKYCMutation } from '../hooks/useProfileMutations';

export default function KycUpload() {
  const uploadKYCMutation = useUploadKYCMutation();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    uploadKYCMutation.mutate(data, {
      onSuccess: () => {
        alert('KYC documents submitted for review!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('idDocument')}
        type="file"
        accept=".pdf,.jpg,.png"
        required
      />
      <input
        {...register('proofOfAddress')}
        type="file"
        accept=".pdf,.jpg,.png"
      />
      <select {...register('idDocumentType')}>
        <option value="passport">Passport</option>
        <option value="license">Driver License</option>
        <option value="national_id">National ID</option>
      </select>
      <button disabled={uploadKYCMutation.isPending}>
        {uploadKYCMutation.isPending ? 'Uploading...' : 'Submit KYC'}
      </button>
    </form>
  );
}
```

### Change Password

```jsx
import { useChangePasswordMutation } from '../hooks/useProfileMutations';

export default function ChangePassword() {
  const changePasswordMutation = useChangePasswordMutation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        alert('Password changed successfully!');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="password"
        {...register('currentPassword', { required: true })}
        placeholder="Current Password"
      />
      <input
        type="password"
        {...register('newPassword', { required: true })}
        placeholder="New Password"
      />
      <input
        type="password"
        {...register('confirmPassword', { required: true })}
        placeholder="Confirm Password"
      />
      <button disabled={changePasswordMutation.isPending}>
        {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
      </button>
      {changePasswordMutation.isError && (
        <p style={{ color: 'red' }}>{changePasswordMutation.error?.message}</p>
      )}
    </form>
  );
}
```

## Hooks

### `useProfileQuery(options)`

Fetch current user's profile.

**Returns:**
- `data`: User profile object
- `isLoading`: Loading state
- `error`: Error object if fetch failed
- `refetch`: Manual refetch function

### `useProfileByIdQuery(userId, options)`

Fetch another user's profile by ID.

**Parameters:**
- `userId`: User ID to fetch

### `useUpdateProfileMutation(options)`

Update user profile information.

**Options:**
- `onSuccess(data)`: Called on successful update
- `onError(error)`: Called on error

### `useUploadAvatarMutation(options)`

Upload user avatar/profile picture.

**Parameters:**
- `file`: File object from input element

### `useUploadKYCMutation(options)`

Upload KYC documents for verification.

**Parameters:**
- `kycData`: Object with files and metadata

### `useChangePasswordMutation(options)`

Change user password.

**Parameters:**
- `passwordData`: { currentPassword, newPassword, confirmPassword }

### `useDeleteAccountMutation(options)`

Delete user account (irreversible).

**Parameters:**
- `password`: Password for confirmation

## API Endpoints

All endpoints are defined in `src/utils/constants.js`:

- `GET /api/users/profile` — Get current user profile
- `GET /api/users/{id}` — Get user by ID
- `PUT /api/users/profile` — Update profile
- `POST /api/users/profile/avatar` — Upload avatar
- `POST /api/users/profile/kyc` — Upload KYC documents
- `POST /api/users/profile/verify-email` — Verify email
- `POST /api/users/profile/change-password` — Change password
- `POST /api/users/profile/delete` — Delete account

## Type Definitions

See `src/features/profile/types/profile.js` for:

- `User` — Full user profile structure
- `UpdateProfileRequest` — Fields that can be updated
- `ChangePasswordRequest` — Password change payload
- `KYCUpload` — KYC document upload payload

## Integration with Auth

Profile updates automatically invalidate the profile query cache via TanStack Query, ensuring UI stays in sync.

When user logs out via `useAuthStore.logout()`, all profile data is cleared.

## Error Handling

All mutations return `ApiResponse<T>` shape:

```js
{
  success: true,
  data: { /* user data */ },
  message: "Profile updated",
  errors: []
}
```

Errors are normalized in `src/services/apiClient.js` and include:
- Network errors
- Validation errors
- Server errors (5xx)

## Next Steps

1. Create UI components in `src/features/profile/components/`:
   - `ProfileCard.jsx` — Display user profile
   - `EditProfileForm.jsx` — Edit form
   - `AvatarUpload.jsx` — Avatar upload
   - `KycUpload.jsx` — KYC upload
   - `ChangePasswordForm.jsx` — Password change

2. Integrate into pages:
   - `src/pages/portfolio.jsx` — Profile viewing/editing
   - `src/pages/dashboardFreelance.jsx` — Profile settings section

3. Add Zustand store if needed for local UI state (modal toggles, form visibility, etc.)

---

## Questions?

See `MIGRATION_GUIDE.md` for general patterns and `src/features/auth/README.md` for the auth feature example.
