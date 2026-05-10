import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Alert, InputForm } from '../../components';
import { forgotPassword } from '../../core/auth/services/authApi';
import {
  ForgotPasswordFormValuesEmptyValue,
  ForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../models/shemas/forgot-password.schema';
import { useI18n } from '../../core/i18n/useI18n';

type ErrorResponse = {
  errors?: Record<string, string[]>;
};

const extractValidationErrors = (error: AxiosError): string[] => {
  const responseData = error.response?.data as ErrorResponse;
  if (responseData?.errors && typeof responseData.errors === 'object') {
    return Object.values(responseData.errors).flat();
  }
  return [];
};

export const ForgotPassword = () => {
  const { t } = useI18n();
  const [errorMsg, setErrorMsg] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: ForgotPasswordFormValuesEmptyValue,
  });

  const { mutate: forgotPasswordMutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      setErrorMsg([]);
      setSuccessMsg(response.message ?? t('fp_success_default'));
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = (formData) => {
    forgotPasswordMutate(
      {
        email: formData.email,
      },
      {
        onError: (error) => {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 400) {
            setErrorMsg(extractValidationErrors(axiosError).length > 0 ? extractValidationErrors(axiosError) : [t('fp_error_request')]);
          } else {
            setErrorMsg([t('fp_error_send')]);
          }
          setSuccessMsg('');
        },
      }
    );
  };

  return (
    <div className="auth-shell fade-in-up">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <h1 className="page-title">{t('fp_title')}</h1>
          <p className="page-subtitle">{t('fp_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <InputForm
              name="email"
              control={control}
              label="Email"
              type="email"
              error={errors.email}
              placeholder="your@email.com"
            />
          </div>

          {successMsg && (
            <Alert
              type="success"
              message={successMsg}
              className="mt-2 mb-4"
              onClose={() => setSuccessMsg('')}
            />
          )}

          {errorMsg.length > 0 && (
            <Alert
              type="error"
              className="mt-2 mb-4"
              onClose={() => setErrorMsg([])}
              message=""
              templateMessage={
                <ul className="list-disc list-inside">
                  {errorMsg.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              }
            />
          )}

          <button type="submit" className="btn-modern btn-primary w-full py-3">
            {isPending ? t('fp_sending') : t('fp_submit')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-600">
              {t('fp_back_to_login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
