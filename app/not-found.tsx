import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-56px)] bg-[var(--background)] overflow-hidden">
      {/* Decorative background 404 */}
      <div 
        className="absolute select-none pointer-events-none text-[25vw] font-black text-[var(--border)] opacity-20 -z-10"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        404
      </div>

      <div className="z-10 flex flex-col items-center text-center p-6 glass rounded-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Page not found</h1>
        <p className="text-[var(--text-muted)] mb-8">
          This page doesn't exist or has been moved.
        </p>
        
        <Link href="/canvas" passHref legacyBehavior>
          <Button className="gap-2 bg-[var(--accent)] hover:bg-indigo-600 text-white w-full h-11 text-base">
            <ArrowLeft className="w-4 h-4" />
            Back to Canvas
          </Button>
        </Link>
      </div>
    </div>
  );
}
