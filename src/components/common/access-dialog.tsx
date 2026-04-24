// @/components/auth/access-info-dialog.tsx
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info,} from "lucide-react";

interface AccessInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessInfoDialog({ isOpen, onClose }: AccessInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md border-none shadow-2xl rounded-3xl z-9999 p-0 overflow-hidden"
      >
        {/* Subtle top accent bar */}
        <div className="h-1.5 w-full bg-blue-500" />
        
        <div className="p-8">
          <div className="flex flex-col items-center justify-center">
            {/* Professional Icon Treatment */}
            <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
              <Info className="h-10 w-10" />
            </div>
            
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-center text-2xl font-black text-slate-900 tracking-tight">
                Account Unassigned
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600 text-sm leading-relaxed max-w-70 mx-auto">
                You've successfully logged in, but your profile isn't linked to a customer yet. 
                
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="mt-8">
            <Button 
              variant="default" 
              className="w-full h-12 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all active:scale-[0.98]" 
              onClick={onClose}
            >
              Continue to Portal
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}