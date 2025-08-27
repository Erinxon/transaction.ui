import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema as schema, type LoginFormValues as FormValues, LoginFormValueEmptyValue as FormValueEmptyValue } from '../../models/shemas/login.shema';
import { Alert, InputForm } from '../../components';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../core/auth/hooks/useLogin';
import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';

export const Login = () => {
    const navigate = useNavigate()
    const [errorMsg, setErrorMsg] = useState('')
    const { mutate, isSuccess, isPending, data } = useLogin()

    useEffect(() => {
        if (isSuccess && data?.accessToken) {
            navigate('/app', { replace: true });
        }
    }, [isSuccess, data, navigate]);

    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: FormValueEmptyValue
    })

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        mutate(data, {
            onError: (error) => {
                const axiosError = error as AxiosError;
                if (axiosError?.status === 401) {
                    setErrorMsg('Credenciales incorrectas');
                } else {
                    setErrorMsg('Error inesperado, intenta más tarde');
                }
            }
        });
    }

    const handleRegister = () => {
        navigate('/register', { replace: true });  
    }

    return (
        <>
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">Finance App</h1>
                        <p className="text-gray-600">Manage your finances easily</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <InputForm name='email' control={control} label='Email' type='string' error={errors.email} placeholder='your@email.com' />
                        </div>

                        <div className="mb-4">
                            <InputForm name='password' control={control} label='Password' type='password' error={errors.password} placeholder='your password' />
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <input type="checkbox" id="remember" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
                                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Remember me</label>
                            </div>
                            <a href="forgot-password.html" className="text-sm text-emerald-600 hover:text-emerald-500">Forgot password?</a>
                        </div>

                        <button type='submit' className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                            {isPending ? 'Entrando...' : ' Sign in'}
                        </button>

                        {errorMsg && (
                            <Alert  type='error'  message={errorMsg} className='mt-2' onClose={() => setErrorMsg('')}/>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?
                            <a onClick={handleRegister} className="font-medium text-emerald-600 hover:text-emerald-500 cursor-pointer"> Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}