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

    const { control, handleSubmit, setValue, formState: { errors, isDirty } } = useForm({
        resolver: zodResolver(UpdateProfileSchema),
        defaultValues: UpdateProfileSchemaFormValuesEmptyValue
    });

    const { mutate: updateMutate, isPending: updateIsPending } = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getProfile"]
            });
        }
    });

    const onSubmit: SubmitHandler<UpdateProfileSchemaFormValues> = (formData) => {
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
            <div className="ml-64 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="mb-4 md:mb-0 md:mr-6">
                                <div className="relative">
                                    <img
                                        src="https://avatar.iran.liara.run/public/15"
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full"
                                    />
                                    {/* <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                                        <i className="fas fa-camera"></i>
                                    </button> */}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">{`${data?.firstName} ${data?.lastName}`}</h2>
                                <p className="text-gray-600">{data?.email}</p>
                                {/* <p className="text-sm text-gray-500 mt-1">Member since: January 2025</p> */}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

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
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Password
                                            </label>
                                            <InputForm name='currentPassword' control={control} type='password' error={errors.currentPassword as FieldError}
                                                placeholder="••••••••" />
                                        </div>
                                        <div></div>
                                        <div>
                                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                                                New Password
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

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!isDirty}
                                            className={`px-4 py-2  border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isDirty ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' : 'bg-emerald-800'}`}
                                        >
                                            {updateIsPending ? 'Guardando...' : ' Save Changes'}
                                        </button>
                                    </div>
                                </form>
                        }
                    </div>
                </div>
            </div>
        </>
    );
};
