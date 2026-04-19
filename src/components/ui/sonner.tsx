"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--surface-card)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--line)",
          "--border-radius": "var(--r-3)",
          "--success-text": "var(--sage)",
          "--error-text": "var(--berry)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-surface-card group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-3 group-[.toaster]:rounded-r-3 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-ink-mute group-[.toast]:text-[13px]",
          actionButton: "group-[.toast]:bg-ink group-[.toast]:text-paper group-[.toast]:font-semibold group-[.toast]:rounded-r-2",
          cancelButton: "group-[.toast]:bg-paper-2 group-[.toast]:text-ink group-[.toast]:border-line group-[.toast]:rounded-r-2",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
