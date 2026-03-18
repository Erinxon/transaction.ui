import { Controller, type Control, type FieldError, type FieldValues, type Path } from "react-hook-form";

interface Option {
  id: number;
  label: string;
}

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: Option[];
  error?: FieldError;
  placeholder?: string;
  className?: string;
}

export const SelectForm = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  error,
  placeholder,
  className
}: Props<T>) => {
  return (
    <>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <select
            id={name}
            {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
            className={
              className ??
              "select-modern"
            }
          >
            {placeholder && <option value={0}>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </>
  );
};
