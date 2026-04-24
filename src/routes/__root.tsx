import {
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { NavigationProgress } from "@/components/navigation-progress";
import { EnterpriseLottieLoader } from "@/components/common/IntialLoader";
import NotFoundError from "@/errors/not-found-error";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: EnterpriseLottieLoader,
  pendingMs: 200,

  component: () => (
    <>
      <NavigationProgress />
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </>
  ),

  notFoundComponent: NotFoundError,

  errorComponent: ({ error }) => {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">
            System Initialization Failed
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error.message || "An unexpected error occurred during startup."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Retry Connection
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  },
});