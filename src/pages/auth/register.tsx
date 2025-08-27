import { useMutation } from "@tanstack/react-query";
import { useForm, type FieldError, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useState } from "react";
import { Alert, CheckboxForm, InputForm } from "../../components";
import { RegisterSchema, RegisterSchemaFormValuesEmptyValue, type RegisterSchemaFormValues } from "../../models/shemas/register.shema";
import { register } from "../../core/auth/services/authApi";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const { control, handleSubmit, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(RegisterSchema),
        defaultValues: RegisterSchemaFormValuesEmptyValue
    });

    const { mutate: updateMutate, isPending: updateIsPending } = useMutation({
        mutationFn: register,
        onSuccess: () => {
            setErrorMsg([]);
            navigate('/login', { replace: true });
        },
    });

    const onSubmit: SubmitHandler<RegisterSchemaFormValues> = (formData) => {
        updateMutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber ?? '',
            receiveEmailNotifications: formData.receiveEmailNotifications ?? false,
            receiveMonthlyExpenseReport: formData.receiveMonthlyExpenseReport ?? false,
            receiveWeeklyExpenseReport: formData.receiveWeeklyExpenseReport ?? false,
            receiveBiweeklyExpenseReport: formData.receiveBiweeklyExpenseReport ?? false,
            sendWeeklyTransactionBackup: formData.sendWeeklyTransactionBackup ?? false,
            password: formData.password ?? ''
        }, {
            onError: (error) => {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 400) {
                    setErrorMsg(extractValidationErrors(axiosError));
                } else {
                    setErrorMsg(['Ha ocurrido un error inesperado al actualizar los datos']);
                }
            }
        });
    }

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
            <div className="bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
                    <div className="flex justify-center items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 text-center">Register</h1>
                    </div>
                    <div >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <InputForm name='firstName' control={control} type='text' error={errors.firstName as FieldError} />
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <InputForm name='lastName' control={control} type='text' error={errors.lastName as FieldError} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <InputForm name='email' control={control} type='email' error={errors.email as FieldError} />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <InputForm name='phoneNumber' control={control} type='tel' error={errors.phoneNumber as FieldError} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <InputForm name='password' control={control} type='password' error={errors.password as FieldError}
                                        placeholder="••••••••" />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <InputForm name='confirmPassword' control={control} type='password' error={errors.confirmPassword as FieldError}
                                        placeholder="••••••••" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <CheckboxForm
                                        name="receiveEmailNotifications"
                                        control={control}
                                        label="Receive email notifications"
                                        error={errors.receiveEmailNotifications}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <CheckboxForm
                                        name="receiveMonthlyExpenseReport"
                                        control={control}
                                        label="Receive monthly expense report"
                                        error={errors.receiveMonthlyExpenseReport}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <CheckboxForm
                                        name="receiveWeeklyExpenseReport"
                                        control={control}
                                        label="Receive weekly expense report"
                                        error={errors.receiveWeeklyExpenseReport}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <CheckboxForm
                                        name="receiveBiweeklyExpenseReport"
                                        control={control}
                                        label="Receive biweekly expense report"
                                        error={errors.receiveBiweeklyExpenseReport}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <CheckboxForm
                                        name="sendWeeklyTransactionBackup"
                                        control={control}
                                        label="  Send weekly transaction backup"
                                        error={errors.sendWeeklyTransactionBackup}
                                    />
                                </div>
                            </div>

                            {errorMsg.length > 0 && (
                                <Alert
                                    type='error'
                                    className='mt-2 mb-4'
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

                            <div className="flex justify-center w-full">
                                <button
                                    type="submit"
                                    disabled={!isDirty}
                                    className={`w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isDirty ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-emerald-800'}`}
                                >
                                    {updateIsPending ? 'Guardando...' : 'Register'}
                                </button>
                            </div>


                            <div className="flex justify-center w-full mt-4">
                                <p className="text-sm text-gray-600">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                                        Inicia sesión
                                    </Link>
                                </p>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </>
    );
};
