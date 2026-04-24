import { useForm } from "@tanstack/react-form";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Loader2, 
  X, 
  User,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- API HOOKS ---
import { useCreateUser } from "../../api/useCreateUser";
import { useGetRoles } from "@/api/useGetRoles";
import { showToastError } from "@/utils/show-toast-success";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateUserSheet({ open, onClose }: Props) {
  // 1. Fetch Roles
  const { data: roles = [], isLoading: isLoadingRoles } = useGetRoles();

  // 2. Mutation Hook
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      role: "", 
      sendInvite: true,
    },
    
    onSubmit: async ({ value }) => {
      try {
        await createUser({
          userName: value.fullName,
          email: value.email,
          roleID: value.role,
        });
        onClose();
      } catch (error) {
        console.error("Submission failed", error);
        showToastError("Creation Failed", "Could not create user. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full data-[side=right]:w-7xl  p-0 gap-0 border-l shadow-2xl bg-white flex flex-col h-full">
        
        {/* --- HEADER --- */}
        <div className="bg-background border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-none">Invite New User</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Add a new member to the organization.
              </p>
            </div>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>
          </SheetClose>
        </div>

        {/* --- FORM CONTENT --- */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-background/50">
          <div className="p-6 space-y-8">
            
            {/* 1. Identity Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Identity</h3>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <form.Field
                  name="fullName"
                  children={(field) => (
                    <div className="grid gap-1.5">
                      <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                      <Input
                        id="fullName"
                        placeholder="e.g. Sarah Connor"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={cn("bg-background", field.state.meta.errors.length && "border-destructive focus-visible:ring-destructive")}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-[0.8rem] text-destructive font-medium">{field.state.meta.errors.join(", ")}</p>
                      )}
                    </div>
                  )}
                />

                {/* Email */}
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="grid gap-1.5">
                      <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className={cn("pl-9 bg-background", field.state.meta.errors.length && "border-destructive focus-visible:ring-destructive")}
                          placeholder="sarah@example.com"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-[0.8rem] text-destructive font-medium">{field.state.meta.errors.join(", ")}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </section>

            {/* 2. Access Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Access Level</h3>
              </div>

              {isLoadingRoles ? (
                <div className="space-y-3">
                   <Skeleton className="h-16 w-full rounded-lg" />
                   <Skeleton className="h-16 w-full rounded-lg" />
                   <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : roles.length === 0 ? (
                 <div className="p-4 text-sm text-center text-muted-foreground border border-dashed rounded-md bg-muted/5">
                   No roles found. Please define roles in settings.
                 </div>
              ) : (
                <form.Field
                  name="role"
                  children={(field) => (
                    <div className="space-y-2">
                        <RadioGroup
                            value={field.state.value}
                            onValueChange={field.handleChange}
                            className="grid gap-3"
                        >
                            {roles.map((role: any) => (
                            <Label
                                key={role.id}
                                htmlFor={role.id}
                                className={cn(
                                "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30",
                                field.state.value === role.id 
                                    ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                    : "bg-background"
                                )}
                            >
                                <RadioGroupItem value={role.id} id={role.id} className="mt-1" />
                                <div className="grid gap-1">
                                    <div className="font-semibold text-sm">{role.name}</div>
                                    <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                                        {role.description || "No description provided."}
                                    </p>
                                </div>
                            </Label>
                            ))}
                        </RadioGroup>
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-[0.8rem] text-destructive font-medium">{field.state.meta.errors.join(", ")}</p>
                        )}
                    </div>
                  )}
                />
              )}
            </section>

            {/* 3. Options Section */}
            <section className="space-y-4">
               <form.Field
                  name="sendInvite"
                  children={(field) => (
                    <div className="flex items-start space-x-3 rounded-lg border p-4 bg-background">
                      <Checkbox 
                        id="sendInvite" 
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(!!checked)}
                        className="mt-0.5"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="sendInvite" className="text-sm font-medium leading-none cursor-pointer">
                          Send email invitation
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          The user will receive an email immediately with instructions to set their password.
                        </p>
                      </div>
                    </div>
                  )}
                />
            </section>

          </div>
        </div>

        {/* --- FOOTER --- */}
        {/* ... inside CreateUserSheet.tsx ... */}

{/* --- FOOTER --- */}
<SheetFooter className="p-6 border-t bg-background mt-auto shrink-0 z-10">
  <div className="flex justify-between items-center w-full">
    <Button 
      variant="ghost" 
      onClick={onClose} 
      disabled={isPending}
      type="button" // 👈 CRITICAL FIX: Prevents form submission
    >
      Cancel
    </Button>
    
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit]) => (
        <Button
          onClick={form.handleSubmit}
          disabled={!canSubmit || isPending}
          className="min-w-35"
          // type="submit" is optional here as it's the default, but good practice
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Inviting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </>
          )}
        </Button>
      )}
    />
  </div>
</SheetFooter>

      </SheetContent>
    </Sheet>
  );
}