import { useSidebar } from "./ui/sidebar"

export function BrandLogo() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div className="flex flex-col pl-2 items-start transition-all duration-200">
      {isCollapsed ? (
        <h1 className="text-xl font-bold text-orange-500">H</h1>
      ) : (
        <>
          <h1 className="text-xl font-bold tracking-tight text-orange-500">
            HUTCHINSONS
          </h1>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            Crop Production Specialists
          </span>
        </>
      )}
    </div>
  )
}
