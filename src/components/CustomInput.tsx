import { useState } from "react";
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
    const isPasswordField = type === 'password';
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputType = isPasswordField && isPasswordVisible ? 'text' : type;

    return (
        <>
            {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <Controller
                name={name}
                control={control} render={({ field }) => {
                    const inputValue =
                        type === 'date' && field.value
                            ? formatDate(field.value, 'YYYY-MM-DD')
                            : (field.value ?? '');

                    return (
                        <div className={isPasswordField ? 'password-field-wrapper' : undefined}>
                            <input
                                type={inputType}
                                id={name}
                                {...field}
                                inputMode={type === 'number' ? 'decimal' : undefined}
                                onChange={(e) => {
                                    if (type === 'number') {
                                        const rawValue = e.target.value;
                                        field.onChange(rawValue === '' ? '' : Number(rawValue));
                                        return;
                                    }
                                    field.onChange(e.target.value);
                                }}
                                value={inputValue}
                                className={`${className ? className : `field-modern ${error ? 'is-invalid' : ''}`} ${isPasswordField ? 'password-input-with-toggle' : ''}`.trim()}
                                placeholder={placeholder}
                            />

                            {isPasswordField && (
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                                    aria-label={isPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                                    aria-pressed={isPasswordVisible}
                                >
                                    {isPasswordVisible ? (
                                        <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.69-1.96 1.83-3.72 3.31-5.14" />
                                            <path d="M9.9 4.24A10.97 10.97 0 0 1 12 4c5 0 9.27 3.11 11 8a11.84 11.84 0 0 1-4.87 5.94" />
                                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                            <path d="M1 1l22 22" />
                                        </svg>
                                    ) : (
                                        <svg className="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                }} />
            {error && <p className='input-error'>{error.message}</p>}
        </>
    )
}

