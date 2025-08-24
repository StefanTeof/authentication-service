"use client"

import * as React from "react"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  const base =
    "flex h-10 w-full rounded-md border border-border px-3 py-2 text-sm " +
    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent " +
    "disabled:cursor-not-allowed disabled:opacity-50"

  const classes = [base, className].filter(Boolean).join(" ")

  return <input ref={ref} className={classes} {...props} />
})
Input.displayName = "Input"
