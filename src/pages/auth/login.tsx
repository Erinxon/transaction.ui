import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema as schema, type LoginFormValues as FormValues, LoginFormValueEmptyValue as FormValueEmptyValue } from '../../models/shemas/login.shema';
import { Alert, InputForm } from '../../components';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../core/auth/hooks/useLogin';
import { useState } from 'react';
import type { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { verifyTwoFactorCode } from '../../core/auth/services/authApi';
import { useAuth } from '../../core/auth/context/useAuth';
import { isAdminToken } from '../../utils';
import { AppRoutes } from '../../models/AppRoutes';
import { useI18n } from '../../core/i18n/useI18n';

export const Login = () => {
    const navigate = useNavigate()
    const { t } = useI18n()
    const [errorMsg, setErrorMsg] = useState('')
    const [infoMsg, setInfoMsg] = useState('')
    const [isTwoFactorStep, setIsTwoFactorStep] = useState(false)
    const { mutate: loginMutate, isPending: isLoginPending } = useLogin()
    const { login: saveTokens } = useAuth()

    const getRedirectPathByRole = (accessToken: string) => {
        if (isAdminToken(accessToken)) {
            return `${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.dashboard}`;
        }

        return `${AppRoutes.private.root}/${AppRoutes.private.dashboard}`;
    };

    const { mutate: verifyCodeMutate, isPending: isVerifyCodePending } = useMutation({
        mutationFn: verifyTwoFactorCode,
        onSuccess: (tokens) => {
            saveTokens({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                requiresTwoFactor: false,
                message: null,
            });
            navigate(getRedirectPathByRole(tokens.accessToken), { replace: true });
        },
        onError: (error) => {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 401 || axiosError.response?.status === 400) {
                setErrorMsg(t('login_error_invalid_code'));
            } else {
                setErrorMsg(t('login_error_verify'));
            }
        }
    });

    const isPending = isLoginPending || isVerifyCodePending;

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: FormValueEmptyValue
    })

    const onSubmit: SubmitHandler<FormValues> = (formData) => {
        if (isPending) {
            return;
        }

        if (isTwoFactorStep) {
            if (!formData.code?.trim()) {
                setErrorMsg(t('login_2fa_required_code'));
                return;
            }

            verifyCodeMutate({
                email: formData.email,
                password: formData.password,
                code: formData.code.trim()
            });
            return;
        }

        loginMutate({
            email: formData.email,
            password: formData.password,
        }, {
            onSuccess: (response) => {
                if (response.requiresTwoFactor) {
                    setIsTwoFactorStep(true);
                    setInfoMsg(response.message ?? t('login_2fa_sent'));
                    return;
                }

                if (response.accessToken && response.refreshToken) {
                    navigate(getRedirectPathByRole(response.accessToken), { replace: true });
                }
            },
            onError: (error) => {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 401) {
                    setErrorMsg(t('login_error_credentials'));
                } else {
                    setErrorMsg(t('login_error_unexpected'));
                }
            }
        });
    }

    const handleRegister = () => {
        navigate('/register', { replace: true });  
    }

    const handleForgotPassword = () => {
        navigate('/forgot-password', { replace: true });
    }

    return (
        <>
            <div className="auth-shell fade-in-up">
                <div className="auth-card">
                    <div className="mb-8 text-center">
                        <h1 className="page-title">Pulse Ledger</h1>
                        <p className="page-subtitle">{t('login_subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <InputForm name='email' control={control} label={t('login_email')} type='string' error={errors.email} placeholder='your@email.com' />
                        </div>

                        <div className="mb-4">
                            <InputForm name='password' control={control} label={t('login_password')} type='password' error={errors.password} placeholder='••••••••' />
                        </div>

                        {isTwoFactorStep && (
                            <div className="mb-4">
                                <InputForm
                                    name='code'
                                    control={control}
                                    label={t('login_2fa_code')}
                                    type='text'
                                    error={errors.code}
                                    placeholder={t('login_2fa_placeholder')}
                                />
                            </div>
                        )}

                        <div className="mb-6" />

                        <div className="mb-4 text-right">
                            <a
                                onClick={handleForgotPassword}
                                className="cursor-pointer text-sm font-medium text-emerald-700 hover:text-emerald-600"
                            >
                                {t('login_forgot_password')}
                            </a>
                        </div>

                        <button
                            type='submit'
                            disabled={isPending}
                            className={`btn-modern btn-primary w-full py-3 ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isPending ? t('login_processing') : isTwoFactorStep ? t('login_verify') : t('login_submit')}
                        </button>

                        {infoMsg && (
                            <Alert type='info' message={infoMsg} className='mt-2' onClose={() => setInfoMsg('')} />
                        )}

                        {errorMsg && (
                            <Alert  type='error'  message={errorMsg} className='mt-2' onClose={() => setErrorMsg('')}/>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            {t('login_no_account')}
                            <a onClick={handleRegister} className="cursor-pointer font-medium text-emerald-700 hover:text-emerald-600"> {t('login_sign_up')}</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}