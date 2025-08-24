"use client"

import { useState } from "react"
import SimplifiedLoginForm from "./login-form"
import RegisterForm from "./register-form"
import Image from "next/image"

export default function AuthLayout() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero section with graduation image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="absolute inset-0">
          <Image src="/auth-bg.jpg" alt="image" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Auth Form */}
          <div className="space-y-6">
            {isLogin ? (
              <SimplifiedLoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
