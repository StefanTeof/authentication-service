"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

interface SelectContextProps {
  value: string
  setValue: (val: string) => void
  open: boolean
  setOpen: (v: boolean) => void
  registerItem: (val: string) => void
  items: string[]
}

const SelectContext = React.createContext<SelectContextProps | undefined>(undefined)

export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState<string[]>([])

  const controlled = value !== undefined
  const currentValue = controlled ? (value as string) : internalValue

  const setValue = (val: string) => {
    if (!controlled) setInternalValue(val)
    onValueChange?.(val)
  }

  const registerItem = React.useCallback((val: string) => {
    setItems((prev) => (prev.includes(val) ? prev : [...prev, val]))
  }, [])

  // Close on outside click
  const rootRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (rootRef.current.contains(e.target as Node)) return
      setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  return (
    <SelectContext.Provider
      value={{ value: currentValue, setValue, open, setOpen, registerItem, items }}
    >
      <div ref={rootRef} className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

/* Trigger */
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function SelectTrigger({ children, className = "", ...props }: SelectTriggerProps) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("SelectTrigger must be used within <Select>")
  const { open, setOpen } = ctx

  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={[
        "flex w-full items-center justify-between px-3 py-2 border rounded-md",
        "bg-background text-foreground border-border focus:outline-none focus:ring-2 focus:ring-ring",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
      <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
    </button>
  )
}

/* Selected value / placeholder */
export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("SelectValue must be used within <Select>")
  return (
    <span className={ctx.value ? "text-foreground" : "text-muted-foreground"}>
      {ctx.value || placeholder}
    </span>
  )
}

/* Dropdown */
export function SelectContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("SelectContent must be used within <Select>")
  const { open, items } = ctx

  const listRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)

  // Keyboard nav
  React.useEffect(() => {
    if (!open) return
    setActiveIndex(Math.max(0, items.findIndex((v) => v === ctx.value)))
  }, [open, items, ctx.value])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      const val = items[activeIndex]
      if (val) {
        ctx.setValue(val)
        ctx.setOpen(false)
      }
    }
  }

  if (!open) return null

  return (
    <div
      ref={listRef}
      role="listbox"
      tabIndex={-1}
      aria-activedescendant={activeIndex >= 0 ? `select-item-${items[activeIndex]}` : undefined}
      onKeyDown={onKeyDown}
      className={[
        "absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg",
        "max-h-64 overflow-auto outline-none",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  )
}

/* Option */
export interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function SelectItem({ value, className = "", children, ...props }: SelectItemProps) {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("SelectItem must be used within <Select>")

  React.useEffect(() => {
    ctx.registerItem(value)
  }, [ctx, value])

  const isSelected = ctx.value === value

  return (
    <button
      id={`select-item-${value}`}
      role="option"
      aria-selected={isSelected}
      type="button"
      onClick={() => {
        ctx.setValue(value)
        ctx.setOpen(false)
      }}
      className={[
        "flex w-full px-3 py-2 text-left text-sm",
        "hover:bg-gray-100 hover:text-primary",
        isSelected ? "bg-accent text-accent-foreground" : "bg-white text-popover-foreground",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  )
}
