"use client"

import * as React from "react"

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const base = "rounded-lg border bg-card text-card-foreground shadow-sm"
  return <div className={[base, className].filter(Boolean).join(" ")} {...props} />
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const base = "p-6"
  return <div className={[base, className].filter(Boolean).join(" ")} {...props} />
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const base = "text-lg font-semibold leading-none tracking-tight"
  return <h3 className={[base, className].filter(Boolean).join(" ")} {...props} />
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const base = "p-6 pt-0"
  return <div className={[base, className].filter(Boolean).join(" ")} {...props} />
}
