"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";

type SignInFormData = {
    email: string;
    password: string;
};

const SignIn = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (_data: SignInFormData) => {
        // Connect your authentication logic here.
        console.info("Sign-in form validated.");
    };

    return (
        <div className="w-full">
            <h1 className="form-title mb-8 text-3xl font-bold text-white">
                Welcome back
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <InputField
                    name="email"
                    label="Email"
                    placeholder="contact@jsmastery.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                        },
                    }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: "Password is required",
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="yellow-btn mt-8 h-11 w-full rounded-lg font-semibold"
                >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                    href="/sign-up"
                    className="font-medium text-gray-200 transition-colors hover:text-yellow-500"
                >
                    Create an account
                </Link>
            </p>
        </div>
    );
};

export default SignIn;