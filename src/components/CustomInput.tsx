import { Controller, type Control, type FieldError, type FieldValues, type Path } from "react-hook-form";
import { formatDate } from "../utils";

interface Props<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    type: string;
    error?: FieldError;
    placeholder?: string;
    className?: string,
    rows?: number
}

export const InputForm = <T extends FieldValues>({ name, control, label, type, error, placeholder, className }: Props<T>) => {
    return (
        <>
            {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <Controller
                name={name}
                control={control} render={({ field }) =>
                    <input
                        type={type}
                        id={name}
                        {...field}
                        onChange={(e) => field.onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                        value={type === 'date' && field.value ? formatDate(field.value, 'YYYY-MM-DD'): field.value ?? ''}
                        className={className ? className : `w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500  ${error ? 'is-invalid' : ''}`}
                        placeholder={placeholder} />
                } />
            {error && <p className='input-error'>{error.message}</p>}
        </>
    )
}

