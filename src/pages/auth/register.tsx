import { useMutation } from "@tanstack/react-query";
import { useForm, type FieldError, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Alert, CheckboxForm, InputForm } from "../../components";
import { RegisterSchema, RegisterSchemaFormValuesEmptyValue, type RegisterSchemaFormValues } from "../../models/shemas/register.shema";
import { register } from "../../core/auth/services/authApi";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const { control, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(RegisterSchema),
        defaultValues: RegisterSchemaFormValuesEmptyValue
    });

    const receiveEmailNotifications = watch('receiveEmailNotifications');

    useEffect(() => {
        if (!receiveEmailNotifications) {
            setValue('receiveMonthlyExpenseReport', false);
            setValue('receiveWeeklyExpenseReport', false);
            setValue('receiveBiweeklyExpenseReport', false);
            setValue('sendWeeklyTransactionBackup', false);
        }
    }, [receiveEmailNotifications, setValue]);

    const { mutate: updateMutate, isPending: updateIsPending } = useMutation({
        mutationFn: register,
        onSuccess: () => {
            setErrorMsg([]);
            navigate('/login', { replace: true });
        },
    });

    const onSubmit: SubmitHandler<RegisterSchemaFormValues> = (formData) => {
        const hasEmailNotifications = formData.receiveEmailNotifications ?? false;

        updateMutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber ?? '',
            receiveEmailNotifications: hasEmailNotifications,
            receiveMonthlyExpenseReport: hasEmailNotifications ? (formData.receiveMonthlyExpenseReport ?? false) : false,
            receiveWeeklyExpenseReport: hasEmailNotifications ? (formData.receiveWeeklyExpenseReport ?? false) : false,
            receiveBiweeklyExpenseReport: hasEmailNotifications ? (formData.receiveBiweeklyExpenseReport ?? false) : false,
            sendWeeklyTransactionBackup: hasEmailNotifications ? (formData.sendWeeklyTransactionBackup ?? false) : false,
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
            <div className="auth-shell fade-in-up">
                <div className="auth-card">
                    <div className="mb-6 flex justify-center items-center">
                        <h1 className="page-title text-center">Create account</h1>
                    </div>
                    <div >
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Personal Information</h3>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="first-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        First Name
                                    </label>
                                    <InputForm name='firstName' control={control} type='text' error={errors.firstName as FieldError} />
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Last Name
                                    </label>
                                    <InputForm name='lastName' control={control} type='text' error={errors.lastName as FieldError} />
                                </div>
                                <div>
                                    <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Email
                                    </label>
                                    <InputForm name='email' control={control} type='email' error={errors.email as FieldError} />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Phone
                                    </label>
                                    <InputForm name='phoneNumber' control={control} type='tel' error={errors.phoneNumber as FieldError} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="new-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Password
                                    </label>
                                    <InputForm name='password' control={control} type='password' error={errors.password as FieldError}
                                        placeholder="••••••••" />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Confirm New Password
                                    </label>
                                    <InputForm name='confirmPassword' control={control} type='password' error={errors.confirmPassword as FieldError}
                                        placeholder="••••••••" />
                                </div>
                            </div>
                            <h3 className="mb-4 text-lg font-semibold text-gray-800">Preferences</h3>
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2">
                                    <CheckboxForm
                                        name="receiveEmailNotifications"
                                        control={control}
                                        label="Receive email notifications"
                                        error={errors.receiveEmailNotifications}
                                    />
                                </div>
                                {receiveEmailNotifications && (
                                    <>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2">
                                            <CheckboxForm
                                                name="receiveMonthlyExpenseReport"
                                                control={control}
                                                label="Receive monthly expense report"
                                                error={errors.receiveMonthlyExpenseReport}
                                            />
                                        </div>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2">
                                            <CheckboxForm
                                                name="receiveWeeklyExpenseReport"
                                                control={control}
                                                label="Receive weekly expense report"
                                                error={errors.receiveWeeklyExpenseReport}
                                            />
                                        </div>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2">
                                            <CheckboxForm
                                                name="receiveBiweeklyExpenseReport"
                                                control={control}
                                                label="Receive biweekly expense report"
                                                error={errors.receiveBiweeklyExpenseReport}
                                            />
                                        </div>
                                        <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2">
                                            <CheckboxForm
                                                name="sendWeeklyTransactionBackup"
                                                control={control}
                                                label="Send weekly transaction backup"
                                                error={errors.sendWeeklyTransactionBackup}
                                            />
                                        </div>
                                    </>
                                )}
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
                                    className={`w-full btn-modern ${isDirty ? 'btn-primary' : 'bg-emerald-900/70 text-white cursor-not-allowed'}`}
                                >
                                    {updateIsPending ? 'Guardando...' : 'Register'}
                                </button>
                            </div>


                            <div className="flex justify-center w-full mt-4">
                                <p className="text-sm text-gray-600">
                                    ¿Ya tienes una cuenta?{' '}
                                    <Link to="/login" className="font-medium text-emerald-700 hover:underline">
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
