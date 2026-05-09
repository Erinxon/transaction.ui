import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, InputForm } from '../../components';
import { resetPassword } from '../../core/auth/services/authApi';
import {
  ResetPasswordFormValuesEmptyValue,
  ResetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../models/shemas/reset-password.schema';
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

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  const emailFromUrl = searchParams.get('email') ?? '';
  const tokenFromUrl = searchParams.get('token') ?? '';

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: ResetPasswordFormValuesEmptyValue,
  });

  useEffect(() => {
    if (emailFromUrl) {
      setValue('email', emailFromUrl);
    }
  }, [emailFromUrl, setValue]);

  const { mutate: resetPasswordMutate, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      setErrorMsg([]);
      setSuccessMsg(response.message ?? t('rp_success_default'));
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = (formData) => {
    if (!tokenFromUrl) {
      setErrorMsg([t('rp_error_invalid_link')]);
      setSuccessMsg('');
      return;
    }

    resetPasswordMutate(
      {
        email: formData.email,
        token: tokenFromUrl,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      },
      {
        onError: (error) => {
          const axiosError = error as AxiosError;
          if (axiosError.response?.status === 400) {
            const errs = extractValidationErrors(axiosError);
            setErrorMsg(errs.length > 0 ? errs : [t('rp_error_request')]);
          } else {
            setErrorMsg([t('rp_error_reset')]);
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
          <h1 className="page-title">{t('rp_title')}</h1>
          <p className="page-subtitle">{t('rp_subtitle')}</p>
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

          <div className="mb-4">
            <InputForm
              name="newPassword"
              control={control}
              label={t('rp_new_password')}
              type="password"
              error={errors.newPassword}
              placeholder="••••••••"
            />
          </div>

          <div className="mb-4">
            <InputForm
              name="confirmPassword"
              control={control}
              label={t('rp_confirm_password')}
              type="password"
              error={errors.confirmPassword}
              placeholder="••••••••"
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
            {isPending ? t('rp_submitting') : t('rp_submit')}
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
