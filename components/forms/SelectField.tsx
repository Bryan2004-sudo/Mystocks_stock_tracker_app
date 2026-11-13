"use client";

import { Controller } from "react-hook-form";
import type {
    Control,
    FieldError,
    FieldValues,
    Path,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps<T extends FieldValues> {
    name: Path<T>;
    label: string;
    placeholder?: string;
    options: readonly {
        label: string;
        value: string;
    }[];
    control: Control<T>;
    error?: FieldError;
    required?: boolean;
}

const SelectField = <T extends FieldValues,>({
                                                 name,
                                                 label,
                                                 placeholder,
                                                 options,
                                                 control,
                                                 error,
                                                 required = false,
                                             }: SelectFieldProps<T>) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">
                {label}
            </Label>

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required
                        ? `Please select ${label.toLowerCase()}`
                        : false,
                }}
                render={({ field }) => (
                    <Select
                        name={field.name}
                        value={
                            typeof field.value === "string"
                                ? field.value
                                : ""
                        }
                        onValueChange={field.onChange}
                    >
                        <SelectTrigger
                            id={name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            aria-invalid={!!error}
                            className="select-trigger w-full border-gray-600 bg-[#141414] text-white focus:border-yellow-500 focus:ring-yellow-500/30"
                        >
                            <SelectValue
                                placeholder={placeholder}
                            />
                        </SelectTrigger>

                        <SelectContent className="border-gray-600 bg-[#1C1C1C] text-white">
                            <SelectGroup>
                                {options.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="cursor-pointer focus:bg-gray-700 focus:text-white"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}
            />

            {error && (
                <p
                    className="text-sm text-red-500"
                    role="alert"
                >
                    {error.message}
                </p>
            )}
        </div>
    );
};

export default SelectField;