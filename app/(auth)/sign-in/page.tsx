
"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/actions/auth.actions";

type SignInFormData = {
    email: string;
    password: string;
};

const SignIn = () => {
    const router = useRouter();
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

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail({
                email: data.email,
                password: data.password,
            });

            if (result.success) {
                toast.success("Signed in successfully!");
                router.push("/");
                router.refresh();
                return;
            }

            toast.error("Sign in failed", {
                description:
                    result.error || "Invalid email or password.",
            });
        } catch (error) {
            console.error("Sign in error:", error);

            toast.error("Sign in failed", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to sign in.",
            });
        }
    };

    return (
        <div className="w-full">
            <h1 className="form-title">
                Welcome back
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                <InputField
                    name="email"
                    label="Email"
                    type="email"
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
                    type="password"
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
                    className="yellow-btn mt-8 w-full"
                >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>

                <FooterLink
                    text="Don't have an account? "
                    linkText="Create an account"
                    href="/sign-up"
                />
            </form>
        </div>
    );
};

export default SignIn;
