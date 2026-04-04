import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "../../../core/profile/services/profileApi";
import { useForm, type FieldError, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema, UpdateProfileSchemaFormValuesEmptyValue, type UpdateProfileSchemaFormValues } from "../../../models/shemas/user-profile.shema";
import { Alert, CheckboxForm, InputForm } from "../../../components";
import type { AxiosError } from "axios";
import { useState, useEffect, useCallback } from "react";
import FormSkeleton from "../../../components/FormSkeleton";
import type { ProfileResponse } from "../../../core/profile/types/profile.types";

export const Profile = () => {
    const queryClient = useQueryClient();
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const { isLoading, error, data } = useQuery({
        queryKey: ["getProfile"],
        queryFn: () => getProfile(),
    });
    const displayFirstName = data?.firstName ?? '';
    const displayLastName = data?.lastName ?? '';
    const displayName = `${displayFirstName} ${displayLastName}`.trim();
    const displayEmail = data?.email ?? '';

    const { control, handleSubmit, setValue, watch, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: UpdateProfileSchemaFormValuesEmptyValue
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
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getProfile"]
            });
        }
    });

    const onSubmit: SubmitHandler<UpdateProfileSchemaFormValues> = (formData) => {
        const hasEmailNotifications = formData.receiveEmailNotifications ?? false;

        updateMutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phoneNumber ?? '',
            twoFactorEnabled: formData.twoFactorEnabled ?? false,
            receiveEmailNotifications: hasEmailNotifications,
            receiveMonthlyExpenseReport: hasEmailNotifications ? (formData.receiveMonthlyExpenseReport ?? false) : false,
            receiveWeeklyExpenseReport: hasEmailNotifications ? (formData.receiveWeeklyExpenseReport ?? false) : false,
            receiveBiweeklyExpenseReport: hasEmailNotifications ? (formData.receiveBiweeklyExpenseReport ?? false) : false,
            sendWeeklyTransactionBackup: hasEmailNotifications ? (formData.sendWeeklyTransactionBackup ?? false) : false,
            changePassword: formData?.currentPassword && formData?.password && formData?.confirmPassword ? {
                currentPassword: formData.currentPassword,
                newPassword: formData.password
            } : null
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

    const setFormValues = useCallback((data: ProfileResponse) => {
        setValue('firstName', data.firstName);
        setValue('lastName', data.lastName);
        setValue('email', data.email);
        setValue('phoneNumber', data.phoneNumber);
        setValue('twoFactorEnabled', data.twoFactorEnabled);
        setValue('receiveEmailNotifications', data.receiveEmailNotifications);
        setValue('receiveMonthlyExpenseReport', data.receiveMonthlyExpenseReport);
        setValue('receiveWeeklyExpenseReport', data.receiveWeeklyExpenseReport);
        setValue('receiveBiweeklyExpenseReport', data.receiveBiweeklyExpenseReport);
        setValue('sendWeeklyTransactionBackup', data.sendWeeklyTransactionBackup);
    }, [setValue]);


    const handleCancel = () => {
        if (data) setFormValues(data);
    };

    useEffect(() => {
        if (data) setFormValues(data);
    }, [data, setFormValues]);

    return (
        <>
            <section className="app-page fade-in-up">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="page-title">Profile</h1>
                        <p className="page-subtitle">Gestiona tus datos, seguridad y preferencias de notificacion.</p>
                    </div>
                </div>
                <div className="soft-card overflow-hidden rounded-2xl">
                    <div className="border-b border-gray-200 p-6">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="mb-4 md:mb-0 md:mr-6">
                                <div className="relative">
                                    <img
                                        src="https://avatar.iran.liara.run/public/15"
                                        alt="Profile"
                                        className="h-32 w-32 rounded-3xl border-4 border-white object-cover shadow-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{displayName || 'Perfil'}</h2>
                                <p className="text-gray-600">{displayEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800">Personal Information</h3>

                        {isLoading ? (<FormSkeleton />)
                            : error ? (
                                <tr>
                                    <td className="text-red-500 text-center" colSpan={5}>
                                        <Alert type="error" message="Error cargando el perfil del usuario" />
                                    </td>
                                </tr>
                            ) :
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
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">Change Password</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="current-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Current Password
                                            </label>
                                            <InputForm name='currentPassword' control={control} type='password' error={errors.currentPassword as FieldError}
                                                placeholder="••••••••" />
                                        </div>
                                        <div></div>
                                        <div>
                                            <label htmlFor="new-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                New Password
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
                                                name="twoFactorEnabled"
                                                control={control}
                                                label="Enable two-factor authentication"
                                                error={errors.twoFactorEnabled}
                                            />
                                        </div>
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

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="btn-modern btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!isDirty}
                                            className={`btn-modern ${isDirty ? 'btn-primary' : 'bg-emerald-900/70 text-white cursor-not-allowed'}`}
                                        >
                                            {updateIsPending ? 'Guardando...' : ' Save Changes'}
                                        </button>
                                    </div>
                                </form>
                        }
                    </div>
                </div>
            </section>
        </>
    );
};
