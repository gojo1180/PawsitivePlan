import { RefreshCw } from "lucide-react";

/**
 * Full-screen centered loading spinner.
 * Used as a fallback while async data is being fetched.
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-mauve">
      <RefreshCw className="animate-spin" size={48} />
    </div>
  );
}
