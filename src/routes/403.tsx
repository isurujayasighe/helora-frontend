import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/403')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">403 - Forbidden</h1>
      <p className="text-muted-foreground">You don’t have permission to view this page.</p>
    </div>
  );
}
