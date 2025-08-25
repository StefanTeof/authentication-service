"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "./ui/select";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { registerUser } from "@/api/auth";
import { ApiError } from "@/lib/api";
import VerificationForm from "./verification-form";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}
interface ApiErrorBody {
  message?: string;
  [key: string]: unknown;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    authType: "site" as const,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // UI messages/errors
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setEmailError(null);
    setUsernameError(null);
    setInfoMessage(null);

    try {
      const res = await registerUser(formData);
      // Success: either "resent" (200) or "created" (201)
      setUserId(res.userId);
      setShowVerification(true);
      setInfoMessage(
        res.status === "resent"
          ? "Account exists but not verified. We’ve resent your verification code."
          : "Account created. Please check your email for the verification code."
      );
    } catch (err) {
      if (err instanceof ApiError) {
        const body = (err.data ?? null) as ApiErrorBody | string | null;
        const serverMsg =
          typeof body === "string"
            ? body
            : (body && typeof body.message === "string" ? body.message : null);
    
        if (err.status === 409) {
          const msg = serverMsg || "Email or username already in use";
          if (/username/i.test(msg)) {
            setUsernameError(msg);
          } else {
            setEmailError(msg);
          }
        } else if (err.status >= 500) {
          setFormError("Something went wrong on our side. Please try again.");
        } else {
          setFormError(serverMsg || "Registration failed. Please try again.");
        }
      } else {
        setFormError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
    
  };

  if (showVerification) {
    return (
      <>
        {infoMessage && (
          <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-center text-blue-900">
            {infoMessage}
          </div>
        )}
        <VerificationForm
          email={formData.email}
          userId={userId}
          onVerificationSuccess={onSwitchToLogin}
          onBackToRegister={() => setShowVerification(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2 select-none">Create Account</h2>
        <p className="text-secondary select-none">
          Fill in your details to create a new account
        </p>
      </div>
      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => updateFormData("firstName", e.target.value)}
            className="h-12 px-4 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => updateFormData("lastName", e.target.value)}
            className="h-12 px-4 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => {
              updateFormData("email", e.target.value);
              if (emailError) setEmailError(null);
            }}
            className={`h-12 px-4 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 ${emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            required
          />
          {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
        </div>

        <div>
          <Input
            type="text"
            placeholder="Enter your username"
            value={formData.username}
            onChange={(e) => {
              updateFormData("username", e.target.value);
              if (usernameError) setUsernameError(null);
            }}
            className={`h-12 px-4 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 ${usernameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
            required
          />
          {usernameError && <p className="mt-1 text-xs text-red-600">{usernameError}</p>}
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => updateFormData("password", e.target.value)}
            className="h-12 px-4 pr-12 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      <Button
        onClick={() => {
          const returnTo = `${window.location.origin}/auth/callback`;
          const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`);
          url.searchParams.set("returnTo", returnTo);
          window.location.assign(url.toString());
        }}
        variant="outline"
        className="w-full border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 bg-transparent"
      >
        <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
        Continue with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <button onClick={onSwitchToLogin} className="text-primary hover:text-gray-600 font-semibold cursor-pointer">
          Sign in
        </button>
      </div>
    </div>
  );
}
