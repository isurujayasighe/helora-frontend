import React from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '../ui/sidebar'
import { Search } from 'lucide-react'

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
        'bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/88 flex h-14 items-center border-b border-border px-4 py-0 sm:gap-4 transition-shadow duration-150 dark:bg-secondary-900/75 dark:border-secondary-700/50',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] ',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <SidebarTrigger variant='ghost' className='mr-1 text-muted-foreground hover:bg-secondary hover:text-primary' />
      
      {children}
    </header>
  )
}

Header.displayName = 'Header'

export function HeaderQuickSearch() {
  return (
    <div className="relative hidden w-full max-w-xl md:block">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        aria-label="Quick search"
        placeholder="Search customers, orders, blocks..."
        className="h-9 w-full rounded-md border border-input bg-[#f6f8fb] pl-10 pr-14 text-sm font-normal text-foreground shadow-inner shadow-slate-900/[0.02] outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring/45 focus:bg-white focus:ring-3 focus:ring-ring/10"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-white px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm lg:block">
        Ctrl K
      </kbd>
    </div>
  )
}
