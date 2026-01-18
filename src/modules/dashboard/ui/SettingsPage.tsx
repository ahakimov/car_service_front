'use client';

import { useState } from 'react';
import { Notification, ProfileTab, PasswordTab } from '../components';
import { useNotification, useSettings } from '../hooks';
import { useAuth } from '@/app/api';
import { httpClient } from '@/app/api/httpClient';
import { API_CONFIG } from '@/app/api/config';

type SettingsPageProps = {
  userRole?: 'manager' | 'client' | 'mechanic';
};

type PasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SettingsPage({ userRole = 'manager' }: SettingsPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const { notification, showNotification, hideNotification } = useNotification();
  const {
    profileData,
    setProfileData,
    originalProfileData,
    loading,
    saving,
    fetchProfile,
    updateProfile,
  } = useSettings({ userRole });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData(originalProfileData);
  };

  const handleSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      showNotification('Successfully updated the details', 'Your changes have been saved', 'success');
      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      showNotification('Error', error.message || 'Failed to save profile', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification('Error', 'Please fill in all password fields', 'error');
      return;
    }

    if (passwordData.newPassword.length <= 8) {
      showNotification('Error', 'Your new password must be more than 8 characters', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Error', 'New passwords do not match', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      const updateData: any = {
        id: user?.userId,
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      };

      const endpoint = userRole === 'manager' 
        ? API_CONFIG.ENDPOINTS.USERS.UPDATE
        : userRole === 'client'
        ? API_CONFIG.ENDPOINTS.CLIENTS.UPDATE
        : API_CONFIG.ENDPOINTS.MECHANICS.UPDATE;

      const response = await httpClient.put(endpoint, updateData);

      if (response.error) {
        showNotification('Error', response.error, 'error');
      } else {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        showNotification('Successfully updated the password', 'Your changes have been saved', 'success');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showNotification('Error', error.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--primary-600)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--neutral-600)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div 
        className="rounded-xl border p-6 max-w-4xl mx-auto"
        style={{ backgroundColor: 'white', borderColor: 'var(--primary-100)' }}
      >
        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
          <button
            onClick={() => setActiveTab('details')}
            className="pb-4 px-2 font-medium text-base transition-colors relative"
            style={{ 
              color: activeTab === 'details' ? 'var(--primary-950)' : 'var(--neutral-600)',
            }}
          >
            My details
            {activeTab === 'details' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--primary-950)' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className="pb-4 px-2 font-medium text-base transition-colors relative"
            style={{ 
              color: activeTab === 'password' ? 'var(--primary-950)' : 'var(--neutral-600)',
            }}
          >
            Password
            {activeTab === 'password' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--primary-950)' }}
              />
            )}
          </button>
        </div>

        {/* My Details Tab */}
        {activeTab === 'details' && (
          <ProfileTab
            profileData={profileData}
            originalProfileData={originalProfileData}
            isEditing={isEditing}
            saving={saving}
            onProfileDataChange={setProfileData}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <PasswordTab
            passwordData={passwordData}
            changingPassword={changingPassword}
            onPasswordDataChange={setPasswordData}
            onChangePassword={handlePasswordChange}
          />
        )}
      </div>

      {/* Notification */}
      <Notification
        isVisible={notification.visible}
        onClose={hideNotification}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}
