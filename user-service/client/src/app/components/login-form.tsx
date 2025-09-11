"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}
interface ApiErrorBody {
  message?: string;
  [key: string]: unknown;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 403 “not verified” flow
  const [showVerification, setShowVerification] = useState(false);
  // const [pendingEmail, setPendingEmail] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      // Ask the browser to save credentials (Chromium + HTTPS or localhost)
      try {
        if (navigator.credentials && (window as any).PasswordCredential) {
          const cred = new (window as any).PasswordCredential({
            id: username.trim(),
            password,
            name: username.trim(),
          });
          await navigator.credentials.store?.(cred);
        }
      } catch (e) {
        // optional: non-blocking
        console.warn("credentials.store failed:", e);
      }

      // Redirect — resolve relative path against current origin
      const raw =
        process.env.NEXT_PUBLIC_CLIENT_SUCCESS_REDIRECT || "/homepage";
      const to = raw.startsWith("http")
        ? raw
        : new URL(
            raw.startsWith("/") ? raw : `/${raw}`,
            window.location.origin
          ).toString();

      window.location.assign(to);
    } catch (err) {
      if (err instanceof ApiError) {
        const body = (err.data ?? null) as ApiErrorBody | string | null;
        const msg =
          (body && typeof body === "object" && body.message) ||
          (typeof body === "string" ? body : null) ||
          err.message;

        switch (err.status) {
          case 401:
            setError("Invalid email/username or password.");
            break;

          case 403:
            setError("User account is not verified."); // 👈 force friendly text
            break;

          case 404:
            setError("User not found. Please check your email/username.");
            break;

          default:
            if (err.status >= 500) {
              setError("Server error. Please try again later.");
            } else {
              setError(msg || "Login failed. Please try again.");
            }
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const returnTo = `${window.location.origin}/auth/callback`;
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`);
    url.searchParams.set("returnTo", returnTo);
    window.location.assign(url.toString());
  };

  // If the account is not verified, show the verification flow immediately
  if (showVerification) {
    return (
      <div className="space-y-4">
        {infoMessage && (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {infoMessage}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                // await resendVerificationCode(pendingEmail);
                setInfoMessage("Verification code resent. Check your inbox.");
              } catch {
                setError("Couldn’t resend the code. Try again in a moment.");
              }
            }}
          >
            Resend code
          </Button>
          <Button variant="ghost" onClick={() => setShowVerification(false)}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2 select-none">Welcome back!</h2>
        <p className="text-secondary select-none">
          Enter your username and password to log in
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
        <div>
          <Input
            id="identifier"
            name="username"
            type="text" // use "email" if you only allow emails
            autoComplete="username"
            placeholder="Enter your username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 px-4 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none">
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
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
        onClick={handleGoogleSignIn}
        variant="outline"
        className="w-full border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 bg-transparent"
      >
        <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
        Log in with Google
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Don&apos;t have an account? </span>
        <button onClick={onSwitchToRegister} className="text-primary hover:text-gray-600 font-semibold cursor-pointer">
          Create account
        </button>
      </div>
    </div>
  );
}
