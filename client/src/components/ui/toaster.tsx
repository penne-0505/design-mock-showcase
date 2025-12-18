import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon =
          variant === "success"
            ? CheckCircle2
            : variant === "info"
              ? Info
              : variant === "destructive"
                ? AlertTriangle
                : null
        const iconClassName =
          variant === "success"
            ? "text-emerald-600 dark:text-emerald-300"
            : variant === "info"
              ? "text-sky-600 dark:text-sky-300"
              : variant === "destructive"
                ? "text-rose-600 dark:text-rose-300"
                : "text-muted-foreground"

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex flex-1 items-center gap-3">
              {Icon && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
                  <Icon className={cn("h-4 w-4", iconClassName)} />
                </div>
              )}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
