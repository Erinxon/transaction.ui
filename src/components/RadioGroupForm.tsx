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
      {label && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((opt) => (
              <label key={opt.value} className="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                <input
                  type="radio"
                  value={opt.value}
                  checked={field.value === opt.value}
                  onChange={() => field.onChange(opt.value)}
                  className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
