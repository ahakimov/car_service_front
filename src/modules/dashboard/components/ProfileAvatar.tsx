type ProfileAvatarProps = {
  name?: string;
};

export function ProfileAvatar({ name }: ProfileAvatarProps) {
  return (
    <div className="flex-shrink-0">
      <div 
        className="w-32 h-32 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: 'var(--primary-100)' }}
      >
        <span 
          className="font-medium text-4xl"
          style={{ color: 'var(--primary-700)' }}
        >
          {name?.charAt(0).toUpperCase() || 'U'}
        </span>
      </div>
    </div>
  );
}
