"use client";

import type {
    FieldError,
    FieldValues,
    Path,
    RegisterOptions,
    UseFormRegister,
} from "react-hook-form";

import type { InputHTMLAttributes } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInputProps<T extends FieldValues> = {
    name: Path<T>;
    label: string;
    placeholder?: string;
    type?: InputHTMLAttributes<HTMLInputElement>["type"];
    register: UseFormRegister<T>;
    error?: FieldError;
    validation?: RegisterOptions<T, Path<T>>;
    disabled?: boolean;
    value?: string;
};

const InputField = <T extends FieldValues,>({
                                                name,
                                                label,
                                                placeholder,
                                                type = "text",
                                                register,
                                                error,
                                                validation,
                                                disabled = false,
                                                value,
                                            }: FormInputProps<T>) => {
    const inputType =
        name === "password" ? "password" : type;

    return (
        <div className="space-y-2">
            <Label
                htmlFor={name}
                className="form-label"
            >
                {label}
            </Label>

            <Input
                id={name}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                defaultValue={value}
                aria-invalid={!!error}
                className="w-full border-gray-700 bg-[#141414] text-white placeholder:text-gray-500"
                {...register(name, validation)}
            />

            {error && (
                <p
                    role="alert"
                    className="text-sm text-red-500"
                >
                    {error.message}
                </p>
            )}
        </div>
    );
};

export default InputField;
