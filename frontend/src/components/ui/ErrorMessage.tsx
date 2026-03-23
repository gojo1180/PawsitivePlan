interface ErrorMessageProps {
  message: string;
  /** Optional: render as a success/info style instead of error */
  variant?: "error" | "success";
}

/**
 * Inline error / success message banner for forms.
 */
export default function ErrorMessage({ message, variant = "error" }: ErrorMessageProps) {
  if (!message) return null;

  const styles =
    variant === "success"
      ? "bg-green/10 border-green text-green"
      : "bg-red/20 border-red text-red";

  return (
    <div className={`border font-semibold p-3 rounded-xl mb-6 text-sm text-center ${styles}`}>
      {message}
    </div>
  );
}
