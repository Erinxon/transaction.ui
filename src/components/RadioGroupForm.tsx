import { Controller, type Control, type FieldError, type FieldValues, type Path } from "react-hook-form";

interface RadioOption {
  value: number;
  label: string;
}

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: RadioOption[];
  error?: FieldError;
  className?: string;
}

export const RadioGroupForm = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  error,
  className
}: Props<T>) => {
  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex space-x-4">
            {options.map((opt) => (
              <label key={opt.value} className="inline-flex items-center">
                <input
                  type="radio"
                  value={opt.value}
                  checked={field.value === opt.value}
                  onChange={() => field.onChange(opt.value)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};
