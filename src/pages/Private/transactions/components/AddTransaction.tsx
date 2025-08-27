import { useMutation, useQuery } from "@tanstack/react-query"
import { createTransaction, updateTransaction } from "../../../../core/transactions/services/transactionApi"
import { useForm, type FieldError, type SubmitHandler } from "react-hook-form";
import { UserTransactionFormValueEmptyValue, UserTransactionSchema, type UserTransactionFormValues } from "../../../../models/shemas/user-transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Alert, InputForm, RadioGroupForm, SelectForm, TextAreaForm } from "../../../../components";
import { useState } from "react";
import { getAllCategories } from "../../../../core/Category/services/categoryApi";
import type { TransactionResponse } from "../../../../core/transactions/types/transaction.types";
import { useModalContext } from "../../../../components/Modal/context";

interface Props {
    data: TransactionResponse | null,
    onSuccess: () => void
}

export const AddTransaction = ({ data, onSuccess }: Props) => {
    const { setIsOpen } = useModalContext()
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const { data: categories } = useQuery({
        queryKey: ["allCategories"],
        queryFn: () => getAllCategories(),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            onSuccess()
        }
    });

    const { mutate: updateMutate, isPending: updateIsPending } = useMutation({
        mutationFn: updateTransaction,
        onSuccess: () => {
            onSuccess()
        }
    });

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(UserTransactionSchema),
        defaultValues: data?.id ? {
            amount: data.amount,
            date: data.date,
            description: data.description,
            transactionTypeId: data.transactionTypeId,
            categoryId: data.categoryId
        } : UserTransactionFormValueEmptyValue
    })

    const onSubmit: SubmitHandler<UserTransactionFormValues> = (formData) => {
        if (data?.id) {
            updateMutate({
                id: data.id,
                amount: formData.amount,
                date: formData.date,
                description: formData.description,
                transactionTypeId: formData.transactionTypeId,
                categoryId: formData.categoryId
            }, {
                onError: (error) => {
                    const axiosError = error as AxiosError;
                    if (axiosError.response?.status === 400) {
                        setErrorMsg(extractValidationErrors(axiosError));
                    } else {
                        setErrorMsg(['Ha ocurrido un error inesperado al guardar el registro']);
                    }
                }
            });
            return;
        } else {
            mutate(formData, {
                onError: (error) => {
                    const axiosError = error as AxiosError;
                    if (axiosError.response?.status === 400) {
                        setErrorMsg(extractValidationErrors(axiosError));
                    } else {
                        setErrorMsg(['Ha ocurrido un error inesperado al guardar el registro']);
                    }
                }
            });
        }
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

    const handlerCancel = () => {
        setIsOpen(false)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
                <RadioGroupForm
                    name="transactionTypeId"
                    control={control}
                    label="Transaction Type"
                    options={[
                        { value: 1, label: "Income" },
                        { value: 2, label: "Expense" }
                    ]}
                    error={errors.transactionTypeId}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <InputForm name='amount' control={control} type='number' placeholder='0.00'
                        className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <InputForm name='date' control={control} type='date' error={errors.date as FieldError}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <SelectForm name='categoryId' control={control} error={errors.categoryId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Select a category"
                    options={categories?.map(category => ({
                        id: category.id,
                        label: category.name
                    })) ?? []} />
            </div>

            <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <TextAreaForm name='description' control={control} error={errors.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Add a comment..." />
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
                <button type="button" onClick={handlerCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer" id="cancel-add-btn">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer">
                    {isPending || updateIsPending ? 'Guardando...' : 'Save Transaction'}
                </button>
            </div>
        </form>
    )
}