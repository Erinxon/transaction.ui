import { useMutation, useQuery } from "@tanstack/react-query"
import { createTransaction, updateTransaction } from "../../../../core/transactions/services/transactionApi"
import { useForm, type FieldError, type SubmitHandler } from "react-hook-form";
import { UserTransactionFormValueEmptyValue, UserTransactionSchema, type UserTransactionFormValues } from "../../../../models/shemas/user-transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { Alert, InputForm, RadioGroupForm, SelectForm, TextAreaForm } from "../../../../components";
import { useEffect, useState } from "react";
import { getAllCategories } from "../../../../core/Category/services/categoryApi";
import { TransactionType } from "../../../../core/Category/types/category.types";
import type { TransactionResponse } from "../../../../core/transactions/types/transaction.types";
import { useModalContext } from "../../../../components/Modal/context";

interface Props {
    data: TransactionResponse | null,
    onSuccess: () => void
}

export const AddTransaction = ({ data, onSuccess }: Props) => {
    const { setIsOpen } = useModalContext()
    const [errorMsg, setErrorMsg] = useState<string[]>([]);

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(UserTransactionSchema),
        defaultValues: data?.id ? {
            amount: data.amount,
            date: data.date,
            description: data.description,
            transactionTypeId: data.transactionTypeId,
            categoryId: data.categoryId
        } : UserTransactionFormValueEmptyValue
    })

    const selectedTransactionType = watch("transactionTypeId");
    const selectedCategoryId = watch("categoryId");

    const { data: categories, isFetched: isCategoriesFetched } = useQuery({
        queryKey: ["allCategories", selectedTransactionType],
        queryFn: () => getAllCategories(
            selectedTransactionType > 0 ? selectedTransactionType as TransactionType : undefined,
        ),
    })

    useEffect(() => {
        if (!isCategoriesFetched) {
            return;
        }

        if (!selectedCategoryId || selectedCategoryId <= 0) {
            return;
        }

        const isValidCategory = categories?.some((category) => category.id === selectedCategoryId) ?? false;
        if (!isValidCategory) {
            setValue("categoryId", 0, { shouldValidate: true });
        }
    }, [categories, isCategoriesFetched, selectedCategoryId, setValue]);

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
                <label htmlFor="amount" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</label>
                <div className="flex items-center rounded-xl border border-[#cedbd4] bg-[#fcfffd] px-3 focus-within:ring-4 focus-within:ring-[var(--ring)]">
                    <span className="text-sm font-semibold text-gray-500">$</span>
                    <InputForm name='amount' control={control} type='number' placeholder='0.00'
                        className="amount-input w-full border-0 bg-transparent py-2.5 pl-2 pr-0 text-gray-900 tabular-nums focus:outline-none" />
                </div>
                {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="date" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Date</label>
                <InputForm name='date' control={control} type='date' error={errors.date as FieldError}
                    className="field-modern" />
            </div>

            <div className="mb-4">
                <label htmlFor="category" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
                <SelectForm name='categoryId' control={control} error={errors.categoryId}
                    className="select-modern"
                    placeholder={selectedTransactionType > 0 ? "Select a category" : "Select a transaction type first"}
                    options={categories?.map(category => ({
                        id: category.id,
                        label: category.name
                    })) ?? []} />
            </div>

            <div className="mb-6">
                <label htmlFor="comment" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Comment</label>
                <TextAreaForm name='description' control={control} error={errors.description}
                    className="textarea-modern"
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
                <button type="button" onClick={handlerCancel} className="btn-modern btn-secondary" id="cancel-add-btn">
                    Cancel
                </button>
                <button type="submit" className="btn-modern btn-primary">
                    {isPending || updateIsPending ? 'Guardando...' : 'Save Transaction'}
                </button>
            </div>
        </form>
    )
}