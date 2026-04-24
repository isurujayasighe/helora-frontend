import React from 'react'
import { cn } from '@/lib/utils'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'bg-white flex h-14 items-center border border-slate-200  p-4 sm:gap-4 transition-shadow duration-300 dark:bg-secondary-900/75 dark:border-secondary-700/50',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] ',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-0',
        className
      )}
      {...props}
    >
      {/* <SidebarTrigger variant='ghost' className='scale-125 sm:scale-100' /> */}
      
      {children}
    </header>
  )
}

Header.displayName = 'Header'
