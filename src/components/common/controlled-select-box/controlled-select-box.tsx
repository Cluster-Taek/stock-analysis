import MultiSelect from '../multi-select';
import { Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface IControlledSelectBoxProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  placeholder?: string;
  name: Path<T>;
  rules?: Parameters<UseFormReturn<T>['register']>[1];
  options: Option[];
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}

export const ControlledSelectBox = <T extends FieldValues>({
  form,
  placeholder,
  name,
  rules,
  options,
  multiple = false,
  searchable = false,
  disabled = false,
}: IControlledSelectBoxProps<T>) => {
  return (
    <Controller
      control={form.control}
      name={name}
      rules={rules}
      render={({ field: { ref, onChange, ...field } }) => {
        // form field 값을 처리하여 MultiSelect에 전달할 value 형태로 변환
        const processFieldValue = (value: string | string[] | null | undefined) => {
          if (!value) {
            return multiple ? [] : '';
          }

          // 문자열이고 콤마로 구분된 경우 배열로 변환
          if (typeof value === 'string' && value.includes(',')) {
            const stringArray = value
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean);
            return multiple ? stringArray : stringArray[0] || '';
          }

          // 이미 배열인 경우
          if (Array.isArray(value)) {
            return multiple ? value : value[0] || '';
          }

          // 단일 값인 경우
          return multiple ? [value] : value;
        };

        const currentValue = processFieldValue(field.value);

        return (
          <div className="relative flex flex-col w-full gap-2">
            <MultiSelect
              aria-invalid={!!form.formState.errors?.[name]}
              {...field}
              value={currentValue}
              onValueChange={onChange}
              multiple={multiple}
              searchable={searchable}
              disabled={disabled}
            >
              <MultiSelect.Trigger ref={ref}>
                <MultiSelect.Value placeholder={placeholder} />
              </MultiSelect.Trigger>
              <MultiSelect.Content>
                {options.map((option) => (
                  <MultiSelect.Item key={option.value} value={option.value}>
                    {option.label}
                  </MultiSelect.Item>
                ))}
              </MultiSelect.Content>
            </MultiSelect>
            {form.formState.errors?.[name]?.message && (
              <div className="text-xs text-red-500">
                {JSON.stringify(form.formState.errors?.[name]?.message).replaceAll(`"`, '')}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};
