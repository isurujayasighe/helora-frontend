"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  Phone,
  Download,
  Clock3,
  MapPin,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const supportSteps = [
  "Compose a new email to support@customerportal.com",
  "Use subject: Feedback, Bug Report, or Complaint",
  "Describe the issue with relevant details or screenshots",
  "Include your name and company name",
  "Send — we’ll respond within 2 business days",
];

export function SupportPage() {
  const handleComposeEmail = () => {
    window.location.href =
      "mailto:support@customerportal.com?subject=Support Request";
  };

  const handleDownloadGuide = () => {
    // replace with your actual file url
    window.open("/documents/customer-portal-user-guide.pdf", "_blank");
  };

  return (
    <AnimatePresence mode="wait">
        <motion.div
          key="support"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="mx-auto max-w-7xl space-y-6 p-2 py-4 pb-10 lg:p-8"
        >
          <div className="mx-auto min-h-screen max-w-5xl p-4 md:p-6">
            {/* Section Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Support & Contact
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Reach our support team, report issues, and access your user
                documentation.
              </p>
            </div>

            <div className="space-y-5">
              {/* Contact Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-slate-200 shadow-sm ring-0">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Mail className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        Email Support
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        General enquiries & non-urgent issues
                      </p>
                      <button
                        onClick={handleComposeEmail}
                        className="mt-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        support@customerportal.com →
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Phone className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">
                        Phone Support
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Mon–Fri, 9:00 AM – 5:30 PM GMT
                      </p>
                      <a
                        href="tel:+4412345678"
                        className="mt-2 inline-block text-sm font-semibold text-orange-500 transition-colors hover:text-orange-600"
                      >
                        +44 (0) 1234 5678 →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Issue */}
              <Card className="overflow-hidden border border-slate-200 shadow-sm p-0">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Report an Issue
                    </h3>
                  </div>

                  <span className="text-xs text-slate-500">
                    Response within 1 business days
                  </span>
                </div>

                <CardContent className="p-5 md:p-6">
                  <p className="mb-6 text-sm text-slate-500">
                    For feedback, bug reports, or complaints — follow these
                    steps to contact our support team:
                  </p>

                  <div className="space-y-4">
                    {supportSteps.map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <p className="pt-1 text-sm text-slate-600">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Button onClick={handleComposeEmail} className="gap-2">
                      <Mail className="h-4 w-4" />
                      Compose Email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Guide */}
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <BookOpen className="h-8 w-8" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        Customer Portal User Guide
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        v2.1
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Complete guide covering login, navigation, invoices,
                      orders, account management, and more.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleDownloadGuide}
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>

                      <span className="text-xs text-slate-400">3.2 MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bottom Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Clock3 className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        Support Hours
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <p>• Mon – Fri: 9:00 AM – 5:30 PM (GMT)</p>
                      <p>• Weekends: Closed</p>
                      <p className="pt-1 font-medium text-orange-500">
                        Emergency phone support available outside hours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        Office Address
                      </h3>
                    </div>

                    <div className="space-y-1 text-sm text-slate-600">
                      <p>Customer Portal Support</p>
                      <p>123 Business Park, Suite 400</p>
                      <p>London, EC2A 1NT</p>
                      <p>United Kingdom</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
  );
}