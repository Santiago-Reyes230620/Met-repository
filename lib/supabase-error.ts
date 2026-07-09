type SupabaseErrorShape = {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
};

const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export function mapSupabaseErrorMessage(error: unknown): string {
  const fallback = "Unexpected database error";

  const fromNativeError = error instanceof Error ? error.message : "";
  const fromObject = (error && typeof error === "object" ? (error as SupabaseErrorShape) : null);

  const message = asText(fromNativeError) || asText(fromObject?.message) || fallback;
  const details = asText(fromObject?.details);
  const hint = asText(fromObject?.hint);
  const code = asText(fromObject?.code).toUpperCase();

  const normalized = `${message} ${details} ${hint} ${code}`.toLowerCase();

  if (
    code === "PGRST205" ||
    code === "42P01" ||
    normalized.includes("schema cache") ||
    normalized.includes("could not find the table 'public.profiles'") ||
    normalized.includes("relation \"public.profiles\" does not exist") ||
    normalized.includes("relation \"profiles\" does not exist")
  ) {
    return "Database setup is incomplete: missing public.profiles table. Run the latest Supabase migrations in your production project.";
  }

  if (
    code === "42501" ||
    normalized.includes("row-level security") ||
    normalized.includes("permission denied")
  ) {
    return "Database permissions blocked this action. Verify RLS policies for profiles (select/insert/update for auth.uid() = id).";
  }

  if (normalized.includes("jwt") || normalized.includes("token") || normalized.includes("unauthorized")) {
    return "Your session is invalid or expired. Please sign in again.";
  }

  return message;
}
