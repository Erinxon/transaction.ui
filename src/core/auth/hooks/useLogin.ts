import { useMutation } from '@tanstack/react-query';
import { login } from '../services/authApi';
import { useAuth } from '../context/useAuth';

export const useLogin = () => {
  const { login: saveTokens } = useAuth();

  return useMutation({
    mutationFn: login, 
    onSuccess: (data) => {
      saveTokens(data);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};