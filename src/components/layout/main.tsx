import React from 'react'
import { cn } from '@/lib/utils'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Main = ({ fixed, className, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'min-h-0 flex-1 peer-[.header-fixed]/header:mt-14',
        fixed && 'fixed-main flex grow flex-col overflow-hidden',
        className
      )}
      {...props}
    />
  )
}

Main.displayName = 'Main'
