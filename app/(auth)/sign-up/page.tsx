"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import { CountrySelectField } from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";

import { Button } from "@/components/ui/button";

import {
    INVESTMENT_GOALS,
    PREFERRED_INDUSTRIES,
    RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";

import { signUpWithEmail } from "@/lib/actions/auth.actions";

type SignUpFormData = {
    fullname: string;
    email: string;
    password: string;
    country: string;
    investmentGoals: string;
    riskTolerance: string;
    preferredIndustry: string;
};

const SignUp = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>({
        defaultValues: {
            fullname: "",
            email: "",
            password: "",
            country: "PH",
            investmentGoals: "balanced",
            riskTolerance: "medium",
            preferredIndustry: "technology",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: SignUpFormData) => {
        try {
            const result = await signUpWithEmail({
                email: data.email,
                password: data.password,
                fullName: data.fullname,
                country: data.country,
                investmentGoals: data.investmentGoals,
                riskTolerance: data.riskTolerance,
                preferredIndustry: data.preferredIndustry,
            });

            if (result.success) {
                toast.success("Account created successfully!");

                if (result.warning) {
                    toast.warning(result.warning);
                }

                router.push("/");
                return;
            }

            toast.error("Sign up failed", {
                description:
                    result.error ||
                    "Failed to create an account.",
            });
        } catch (error) {
            console.error("Sign up error:", error);

            toast.error("Sign up failed", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to create an account.",
            });
        }
    };

    return (
        <div className="w-full">
            <h1 className="form-title">
                Sign Up &amp; Personalize
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <InputField
                    name="fullname"
                    label="Full Name"
                    placeholder="Adrian | JS Mastery"
                    register={register}
                    error={errors.fullname}
                    validation={{
                        required: "Full name is required",
                        minLength: {
                            value: 2,
                            message:
                                "Name must be at least 2 characters",
                        },
                    }}
                />

                <InputField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="contact@jsmastery.pro"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message:
                                "Enter a valid email address",
                        },
                    }}
                />

                <InputField
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Enter a strong password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message:
                                "Password must be at least 8 characters",
                        },
                    }}
                />

                <CountrySelectField
                    name="country"
                    label="Country"
                    control={control}
                    error={errors.country}
                    required
                />

                <SelectField
                    name="investmentGoals"
                    label="Investment Goals"
                    placeholder="Select your investment goal"
                    options={INVESTMENT_GOALS}
                    control={control}
                    error={errors.investmentGoals}
                    required
                />

                <SelectField
                    name="riskTolerance"
                    label="Risk Tolerance"
                    placeholder="Select your risk level"
                    options={RISK_TOLERANCE_OPTIONS}
                    control={control}
                    error={errors.riskTolerance}
                    required
                />

                <SelectField
                    name="preferredIndustry"
                    label="Preferred Industry"
                    placeholder="Select your preferred industry"
                    options={PREFERRED_INDUSTRIES}
                    control={control}
                    error={errors.preferredIndustry}
                    required
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="yellow-btn mt-8 w-full"
                >
                    {isSubmitting
                        ? "Creating Account..."
                        : "Start Your Investing Journey"}
                </Button>

                <FooterLink
                    text="Already have an account? "
                    linkText="Sign in"
                    href="/sign-in"
                />
            </form>
        </div>
    );
};

export default SignUp;