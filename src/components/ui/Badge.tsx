import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-[#FF5A1F]/30 bg-[#FF5A1F]/10 text-[#FF5A1F]',
        secondary: 'border-border bg-secondary text-secondary-foreground',
        success: 'border-green-500/30 bg-green-500/10 text-green-400',
        warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
        danger: 'border-red-500/30 bg-red-500/10 text-red-400',
        blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
