import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TenantLogoProps {
  src?: string | null;
  fallback: string;
  alt: string;
  className?: string;
}

export function TenantLogo({ src, fallback, alt, className }: TenantLogoProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallback);
  const [errorCount, setErrorCount] = useState(0);

  // Sync state if tenant logo loads late (e.g., from an async store)
  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  const handleError = () => {
    // Prevent infinite loops if fallback also fails
    if (errorCount < 1) {
      setImgSrc(fallback);
      setErrorCount((prev) => prev + 1);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        // Optimization: Priority hint for the most important image on the page
        fetchPriority="high" 
        // Prevent layout shift by maintaining aspect ratio
        className="h-full w-full object-contain object-left transition-opacity duration-300"
        onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        style={{ opacity: 0 }}
      />
    </div>
  );
}