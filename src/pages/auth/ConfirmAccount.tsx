import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { confirmAccount } from '../../core/auth/services/confirmAccountApi';
import { Link, useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { Alert } from '../../components';
import { AppRoutes } from '../../models/AppRoutes';

const ConfirmAccount = () => {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    const [errorMsg, setErrorMsg] = useState<string[]>([]);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const { mutate: confirmAccountMutate, isPending } = useMutation({
        mutationFn: ({ userId, token }: { userId: string, token: string }) => confirmAccount(userId, token),
        onSuccess: () => {
            setIsConfirmed(true);
            setErrorMsg([]);
        },
    });

    useEffect(() => {
        if (userId && token) {
            setIsConfirmed(false);
            setErrorMsg([]);
            confirmAccountMutate({ userId, token },
                {
                    onError: (error) => {
                        const axiosError = error as AxiosError;
                        setIsConfirmed(false);
                        if (axiosError.response?.status === 400) {
                            setErrorMsg(extractValidationErrors(axiosError));
                        } else {
                            setErrorMsg(['Ha ocurrido un error inesperado al confirmar la cuenta']);
                        }
                    }
                }
            );
        } else {
            setIsConfirmed(false);
            setErrorMsg(['Faltan parámetros en la URL']);
        }
    }, [confirmAccountMutate, token, userId]);

    type ErrorResponse = {
        errors?: Record<string, string[]>;
    };

    const extractValidationErrors = (error: AxiosError): string[] => {
        const responseData = error.response?.data as ErrorResponse;
        if (responseData?.errors && typeof responseData.errors === 'object') {
            return Object.values(responseData.errors).flat();
        }
        return ['Ha ocurrido un error inesperado al guardar el registro'];
    };

    return (
        <div className="auth-shell fade-in-up">
            <div className="auth-card">
                <div className="mb-8 text-center">
                    <h1 className="page-title">Confirmar cuenta</h1>
                    <p className="page-subtitle">
                        {isPending ? 'Verificando tu correo...' : 'Validamos tu enlace para activar tu cuenta.'}
                    </p>
                </div>

                {isPending && (
                    <div className="mb-6 flex items-center justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-600" />
                    </div>
                )}

                {isConfirmed && !isPending && (
                    <Alert
                        type="success"
                        message="Tu cuenta fue confirmada correctamente. Ya puedes iniciar sesion."
                        className="mb-4"
                    />
                )}

                {errorMsg.length > 0 && !isPending && (
                    <Alert
                        type="error"
                        className="mb-4"
                        onClose={() => setErrorMsg([])}
                        message=""
                        templateMessage={(
                            <ul className="list-disc list-inside">
                                {errorMsg.map((msg, idx) => (
                                    <li key={idx}>{msg}</li>
                                ))}
                            </ul>
                        )}
                    />
                )}

                <div className="mt-6 grid gap-3">
                    <Link to={AppRoutes.login} className="btn-modern btn-primary w-full py-3 text-center">
                        Iniciar sesion
                    </Link>
                    <Link to={AppRoutes.register} className="btn-modern btn-secondary w-full py-3 text-center">
                        Crear cuenta
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ConfirmAccount;