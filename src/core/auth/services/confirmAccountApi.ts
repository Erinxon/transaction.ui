import api from '../../api/axios';

export const confirmAccount = async (userId: string, token: string): Promise<void> => {
  await api.post('/auth/confirm-account', { userId, token });
};