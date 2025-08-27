import { useMutation, useQueryClient } from '@tanstack/react-query';
import './ConfirmAccount.style.css';
import { useEffect, useState } from 'react';
import { confirmAccount } from '../../core/auth/services/confirmAccountApi';
import { useSearchParams } from 'react-router-dom';
import type { AxiosError } from 'axios';

const ConfirmAccount = () => {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    const queryClient = useQueryClient();
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const { mutate: confirmAccountMutate, isPending } = useMutation({
        mutationFn: ({ userId, token }: { userId: string, token: string }) => confirmAccount(userId, token)
    });

    useEffect(() => {
        if (userId && token) {
            confirmAccountMutate({ userId, token },
                {
                    onError: (error) => {
                        const axiosError = error as AxiosError;
                        if (axiosError.response?.status === 400) {
                            setErrorMsg(extractValidationErrors(axiosError));
                        } else {
                            setErrorMsg(['Ha ocurrido un error inesperado al actualizar los datos']);
                        }
                    }
                }
            );
        } else {
            setErrorMsg(['Faltan parámetros en la URL']);
        }
    }, [userId, token]);

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
        <>
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-emerald-600">💰 Finance App</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="login.html" className="text-gray-600 hover:text-emerald-600 transition-colors">Iniciar Sesión</a>
                            <a href="register.html" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">Registrarse</a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex items-center justify-center min-h-screen p-4 -mt-16">
                <div className="w-full max-w-lg">
                    <div id="success-card" className="hidden">
                        <div className="bg-white rounded-2xl card-shadow p-8 text-center bounce-in">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                    <i className="fas fa-check text-emerald-600 text-4xl"></i>
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <i className="fas fa-star text-white text-sm"></i>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Cuenta Verificada!</h1>
                            <p className="text-gray-600 mb-8">
                                ¡Excelente! Tu email ha sido confirmado exitosamente. Tu cuenta está lista para usar.
                            </p>


                            <div className="space-y-4">
                                <a href="dashboard.html" className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center group">
                                    <i className="fas fa-rocket mr-3 group-hover:animate-bounce"></i>
                                    Comenzar Ahora
                                </a>

                                <div className="grid grid-cols-2 gap-3">
                                    <a href="add-transaction.html" className="bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center text-sm">
                                        <i className="fas fa-plus mr-2"></i>
                                        Primera Transacción
                                    </a>
                                    <a href="profile.html" className="bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center text-sm">
                                        <i className="fas fa-user mr-2"></i>
                                        Configurar Perfil
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="error-card" className="hidden">
                        <div className="bg-white rounded-2xl card-shadow p-8 text-center slide-up">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <i className="fas fa-exclamation-triangle text-red-600 text-4xl"></i>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verificación Fallida</h1>
                            <p className="text-gray-600 mb-8" id="error-description">
                                No pudimos verificar tu email. El enlace puede ser inválido o haber expirado.
                            </p>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
                                <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Posibles causas:
                                </h3>
                                <ul className="text-red-700 text-sm space-y-2">
                                    <li className="flex items-start">
                                        <i className="fas fa-clock text-red-500 mr-2 mt-1 text-xs"></i>
                                        El enlace ha expirado (válido por 24 horas)
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-check-circle text-red-500 mr-2 mt-1 text-xs"></i>
                                        El enlace ya fue utilizado anteriormente
                                    </li>
                                    <li className="flex items-start">
                                        <i className="fas fa-key text-red-500 mr-2 mt-1 text-xs"></i>
                                        El token de verificación es inválido
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <button id="resend-btn" className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center">
                                    <i className="fas fa-envelope mr-3"></i>
                                    Reenviar Email de Confirmación
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <a href="register.html" className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center text-sm">
                                        <i className="fas fa-user-plus mr-2"></i>
                                        Nueva Cuenta
                                    </a>
                                    <a href="login.html" className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center text-sm">
                                        <i className="fas fa-sign-in-alt mr-2"></i>
                                        Iniciar Sesión
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isPending && <div id="loading-card">
                        <div className="bg-white rounded-2xl card-shadow p-8 text-center">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Verificando tu email...</h1>
                            <p className="text-gray-600 mb-8">
                                Por favor espera mientras confirmamos tu dirección de correo electrónico.
                            </p>
                        </div>
                    </div>}


                    <div id="already-verified-card" className="hidden">
                        <div className="bg-white rounded-2xl card-shadow p-8 text-center slide-up">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <i className="fas fa-user-check text-blue-600 text-4xl"></i>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Cuenta Ya Verificada</h1>
                            <p className="text-gray-600 mb-8">
                                Esta cuenta ya ha sido verificada anteriormente. Puedes iniciar sesión normalmente.
                            </p>

                            <div className="space-y-4">
                                <a href="login.html" className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center">
                                    <i className="fas fa-sign-in-alt mr-3"></i>
                                    Iniciar Sesión
                                </a>
                                <a href="dashboard.html" className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                                    <i className="fas fa-tachometer-alt mr-3"></i>
                                    Ir al Dashboard
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default ConfirmAccount;