"use client"

import * as React from "react"
import { Check } from "lucide-react"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  /** Shadcn-like handler to match your usage: onCheckedChange={(v)=>...} */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Accessible, controlled/unstyled <input type="checkbox"> wrapper
 * that exposes data-state="checked|unchecked" for Tailwind selectors like:
 *   data-[state=checked]:bg-primary data-[state=checked]:border-primary
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
    const [internal, setInternal] = React.useState<boolean>(!!defaultChecked)
    const isControlled = typeof checked === "boolean"
    const value = isControlled ? !!checked : internal

    const toggle = (next: boolean) => {
      if (!isControlled) setInternal(next)
      onCheckedChange?.(next)
    }

    const baseBox =
      "h-5 w-5 rounded border border-border flex items-center justify-center bg-background " +
      "transition-colors"

    const classes = [baseBox, className].filter(Boolean).join(" ")

    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <span
          data-state={value ? "checked" : "unchecked"}
          className={classes}
          aria-hidden="true"
        >
          {/* Visual check icon */}
          <Check className={`h-4 w-4 text-white transition-opacity ${value ? "opacity-100" : "opacity-0"}`} />
        </span>

        {/* Actual input for a11y/forms; visually hidden but still focusable via span click */}
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={value}
          onClick={() => toggle(!value)}
          onChange={(e) => toggle(e.target.checked)}
          {...props}
        />
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"
