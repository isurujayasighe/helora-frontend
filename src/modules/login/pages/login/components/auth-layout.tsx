import * as React from "react";
import hutchinsonsLogo from "@/assets/hutchinsons-logo.png";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT: Branding / Message */}
      <div className="hidden lg:flex flex-col justify-center px-16 bg-linear-to-br from-primary/10 to-accent/10">
        <img
          src={hutchinsonsLogo}
          alt="Hutchinsons"
          className="h-16 mb-8 w-fit"
        />

        <h1 className="text-3xl font-bold text-foreground leading-tight">
          Customer Self-Service Portal
        </h1>

        <p className="mt-4 text-muted-foreground max-w-md">
          Secure access to invoices, orders, payments, and account management —
          designed for enterprise customers.
        </p>

        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li>✔ 24/7 account access</li>
          <li>✔ Enterprise-grade security</li>
          <li>✔ Role-based access control</li>
        </ul>
      </div>

      {/* RIGHT: Form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
