"use client";

import { useState } from "react";
import {
    Controller,
    type Control,
    type FieldError,
    type FieldValues,
    type Path,
} from "react-hook-form";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import countryList from "react-select-country-list";

type CountrySelectProps<T extends FieldValues> = {
    name: Path<T>;
    label: string;
    control: Control<T>;
    error?: FieldError;
    required?: boolean;
};

const countries = countryList().getData();

// Convert country code to flag emoji
const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
};

const CountrySelect = ({
                           id,
                           value,
                           onChange,
                           onBlur,
                       }: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
}) => {
    const [open, setOpen] = useState(false);

    const selectedCountry = countries.find(
        (country) => country.value === value
    );

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);

                if (!nextOpen) {
                    onBlur();
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className="country-select-trigger w-full justify-between border-gray-600 bg-[#141414] text-white hover:bg-[#1C1C1C] hover:text-white"
                >
                    {selectedCountry ? (
                        <span className="flex min-w-0 items-center gap-2">
                            <span>
                                {getFlagEmoji(selectedCountry.value)}
                            </span>

                            <span className="truncate">
                                {selectedCountry.label}
                            </span>
                        </span>
                    ) : (
                        <span className="text-gray-400">
                            Select your country...
                        </span>
                    )}

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] min-w-[260px] border-gray-600 bg-gray-800 p-0"
            >
                <Command className="bg-gray-800 text-white">
                    <CommandInput
                        placeholder="Search countries..."
                        className="country-select-input"
                    />

                    <CommandList className="max-h-60 bg-gray-800">
                        <CommandEmpty className="p-3 text-sm text-gray-400">
                            No country found.
                        </CommandEmpty>

                        <CommandGroup className="bg-gray-800">
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.value}
                                    value={`${country.label} ${country.value}`}
                                    onSelect={() => {
                                        onChange(country.value);
                                        setOpen(false);
                                    }}
                                    className="country-select-item cursor-pointer text-white data-[selected=true]:bg-gray-700 data-[selected=true]:text-white"
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 text-yellow-500 ${
                                            value === country.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />

                                    <span className="flex items-center gap-2">
                                        <span>
                                            {getFlagEmoji(country.value)}
                                        </span>

                                        <span>{country.label}</span>
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export function CountrySelectField<T extends FieldValues>({
                                                              name,
                                                              label,
                                                              control,
                                                              error,
                                                              required = false,
                                                          }: CountrySelectProps<T>) {
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
                    <CountrySelect
                        id={name}
                        value={
                            typeof field.value === "string"
                                ? field.value
                                : ""
                        }
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                    />
                )}
            />

            {error && (
                <p className="text-sm text-red-500" role="alert">
                    {error.message}
                </p>
            )}

            <p className="text-xs text-gray-500">
                Helps us show market data and news relevant to you.
            </p>
        </div>
    );
}