import AttendancePage from '@/modules/app/attendance'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/attendance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AttendancePage/>
}
