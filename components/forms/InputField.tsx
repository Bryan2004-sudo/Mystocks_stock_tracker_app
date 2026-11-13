import React from 'react'
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { cn } from "cn";

const InputField = ({name, label, placeholder, type = "text", register, error, validation, disabled, value}: FormInputProps)  => {
    return (
        <div className="space-7-2">
            <label htmlFor={name} className="form-label">
                {label}
            </label>
<Input
    type={type}
    id={name}
    placeholder={placeholder}
    disabled={disabled}
    value={value}
    className={cn('form-input', {'opacity-50 cursor-not-allowd': disabled})}
    {...register(name, validation)}
></Input>
            {error && <p className="text-sm text-red-500" >{error.message}</p>}

        </div>
    )
}
export default InputField
