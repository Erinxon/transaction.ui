import { Controller, type Control, type FieldError, type FieldValues, type Path } from "react-hook-form";

interface Props<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    error?: FieldError;
    placeholder?: string;
    className?: string;
    rows?: number;
}

export const TextAreaForm = <T extends FieldValues>({
    name,
    control,
    label,
    error,
    placeholder,
    className,
    rows
}: Props<T>) => {
    return (
        <>
            {label && (
                <label htmlFor={String(name)} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <textarea
                        id={String(name)}
                        rows={rows ?? 3}
                        {...field}
                        className={
                            className ??
                            'textarea-modern'
                        }
                        placeholder={placeholder}
                    />
                )}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
        </>
    );
};
