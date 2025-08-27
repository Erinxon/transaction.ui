import api from '../../api/axios';
import type { ProfileRequest, ProfileResponse } from '../types/profile.types';

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get('/UserProfile');
  return response.data;
};

export const updateProfile = async (request: ProfileRequest): Promise<void> => {
  const response = await api.put('/UserProfile', request, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};
