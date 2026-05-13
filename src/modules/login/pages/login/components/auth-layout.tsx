import * as React from "react";
import hutchinsonsLogo from "@/assets/hutchinsons-logo.png";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-slate-50 px-16 lg:flex">
        <img
          src={hutchinsonsLogo}
          alt="Hutchinsons"
          className="mb-8 h-16 w-fit"
        />

        <h1 className="text-3xl font-semibold leading-tight text-slate-900">
          Customer Self-Service Portal
        </h1>

        <p className="mt-4 max-w-md text-muted-foreground">
          Secure access to invoices, orders, payments, and account management
          for enterprise customers.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li>24/7 account access</li>
          <li>Enterprise-grade security</li>
          <li>Role-based access control</li>
        </ul>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
