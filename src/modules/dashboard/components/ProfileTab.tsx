import { ProfileAvatar } from './ProfileAvatar';

type ProfileData = {
  name?: string;
  phone?: string;
  email?: string;
};

type ProfileTabProps = {
  profileData: ProfileData;
  originalProfileData: ProfileData;
  isEditing: boolean;
  saving: boolean;
  onProfileDataChange: (data: ProfileData) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function ProfileTab({
  profileData,
  originalProfileData,
  isEditing,
  saving,
  onProfileDataChange,
  onEdit,
  onCancel,
  onSave,
}: ProfileTabProps) {
  return (
    <div>
      <div className="flex items-start gap-6">
        {/* Profile Picture */}
        <ProfileAvatar name={profileData.name} />

        {/* Form Fields */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Name:
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name || ''}
                onChange={(e) => onProfileDataChange({ ...profileData, name: e.target.value })}
                className="px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
              />
            ) : (
              <p className="text-base" style={{ color: 'var(--primary-950)' }}>
                {profileData.name || '-'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Contact Number:
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone || ''}
                onChange={(e) => onProfileDataChange({ ...profileData, phone: e.target.value })}
                className="px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
              />
            ) : (
              <p className="text-base" style={{ color: 'var(--primary-950)' }}>
                {profileData.phone || '-'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label 
              className="font-medium text-sm"
              style={{ color: 'var(--neutral-900)' }}
            >
              Email:
            </label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email || ''}
                onChange={(e) => onProfileDataChange({ ...profileData, email: e.target.value })}
                className="px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
              />
            ) : (
              <p className="text-base" style={{ color: 'var(--primary-950)' }}>
                {profileData.email || '-'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
        {isEditing ? (
          <>
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg border font-medium text-base transition-colors hover:opacity-80 disabled:opacity-50"
              style={{ 
                backgroundColor: 'white',
                borderColor: 'var(--neutral-400)',
                color: 'var(--neutral-700)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--primary-600)',
                borderColor: 'var(--primary-600)',
                color: 'white',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--primary-600)',
              borderColor: 'var(--primary-600)',
              color: 'white',
            }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
