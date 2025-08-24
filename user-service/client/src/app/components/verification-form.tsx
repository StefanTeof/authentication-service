"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { resendVerificationCode, verifyEmail } from "@/api/auth"
import { ApiError } from "@/lib/api"

interface VerificationFormProps {
    email: string
    userId: string
    onVerificationSuccess: () => void
    onBackToRegister: () => void
}

export default function VerificationForm({
    email,
    userId,
    onVerificationSuccess,
    onBackToRegister,
}: VerificationFormProps) {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return // Only allow single digit

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const verificationCode = code.join("")

        if (verificationCode.length !== 6) {
            alert("Please enter all 6 digits")
            return
        }

        setIsLoading(true)
        try {
            const response = await verifyEmail(userId, verificationCode)
            console.log("Email verified successfully:", response)

            onVerificationSuccess()
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 400) {
                    setError("Invalid or expired verification code.");
                    setCode(["", "", "", "", "", ""]); // reset inputs
                    inputRefs.current[0]?.focus();
                } else if (err.status >= 500) {
                    setError("Server error. Please try again later.");
                } else {
                    setError(err.message || "Verification failed. Please try again.");
                }
            } else {
                setError("Network error. Please check your connection.");
            }
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        try {
            await resendVerificationCode(email)
        } catch (error) {
            console.error("Failed to resend code:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center flex flex-col gap-4 space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Verify your email</h2>
                <p className="text-gray-600">
                    We&apos;ve sent a 6-digit verification code to
                    <br />
                    <span className="font-medium text-gray-900">{email}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-3">
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg font-semibold border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                        />

                    ))}
                </div>
                <p className="mt-0 text-center text-xs text-red-600">{error}</p>

                <div className="text-center">
                    <p className="text-sm text-secondary mb-2 italic">Code expires in 10 minutes</p>
                        <button
                            type="button"
                            onClick={handleResendCode}
                            className="cursor-pointer text-sm text-slate-500 hover:text-slate-400 font-medium"
                        >
                            Didn&apos;t receive the code? Resend
                        </button>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                >
                    {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
            </form>

            <div className="text-center">
                <button onClick={onBackToRegister} className="text-sm cursor-pointer text-gray-600 hover:text-gray-800">
                    ← Back to registration
                </button>
            </div>
        </div>
    )
}
