type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordTabProps = {
  passwordData: PasswordData;
  changingPassword: boolean;
  onPasswordDataChange: (data: PasswordData) => void;
  onChangePassword: () => void;
};

export function PasswordTab({
  passwordData,
  changingPassword,
  onPasswordDataChange,
  onChangePassword,
}: PasswordTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <label 
          className="font-medium text-sm"
          style={{ color: 'var(--neutral-900)' }}
        >
          Current password:
        </label>
        <input
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
          placeholder="Enter current password"
          className="max-w-md px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label 
          className="font-medium text-sm"
          style={{ color: 'var(--neutral-900)' }}
        >
          New password:
        </label>
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
          placeholder="Enter new password"
          className="max-w-md px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
        />
        <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
          Your new password must be more than 8 characters.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label 
          className="font-medium text-sm"
          style={{ color: 'var(--neutral-900)' }}
        >
          Confirm new password:
        </label>
        <input
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
          placeholder="Confirm new password"
          className="max-w-md px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--neutral-400)', color: 'var(--primary-950)' }}
        />
      </div>

      <div className="pt-4">
        <button
          onClick={onChangePassword}
          disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          className="px-6 py-2.5 rounded-lg font-medium text-base transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ 
            backgroundColor: 'var(--primary-600)',
            borderColor: 'var(--primary-600)',
            color: 'white',
          }}
        >
          {changingPassword ? 'Changing...' : 'Change password'}
        </button>
      </div>
    </div>
  );
}
