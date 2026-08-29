import { apiCall } from './api';

export const getMe = async () => {
  const result = await apiCall('/users/me');
  return result;
};

export const updateMe = async (data) => {
  const result = await apiCall('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return result;
};

export const updatePassword = async (currentPassword, newPassword) => {
  const result = await apiCall('/users/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return result;
};
