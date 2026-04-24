import * as React from "react";
import { Eye, EyeOff } from "tabler-icons-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className={cn("relative rounded-md", className)}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="***********"
          className="placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-10 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          ref={ref}
          disabled={disabled}
          {...props}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-md text-slate-400 hover:text-slate-700"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
