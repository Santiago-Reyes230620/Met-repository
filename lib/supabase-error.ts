type SupabaseErrorShape = {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
};

const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

function getSupabaseErrorParts(error: unknown) {
  const fallback = "Unexpected database error";

  const fromNativeError = error instanceof Error ? error.message : "";
  const fromObject = (error && typeof error === "object" ? (error as SupabaseErrorShape) : null);

  const message = asText(fromNativeError) || asText(fromObject?.message) || fallback;
  const details = asText(fromObject?.details);
  const hint = asText(fromObject?.hint);
  const code = asText(fromObject?.code).toUpperCase();
  const normalized = `${message} ${details} ${hint} ${code}`.toLowerCase();

  return {
    message,
    details,
    hint,
    code,
    normalized,
  };
}

export function isSupabaseMissingTableError(error: unknown, tableNames: string[] = []): boolean {
  const { code, normalized } = getSupabaseErrorParts(error);

  const isMissingTableError =
    code === "PGRST205" ||
    code === "42P01" ||
    normalized.includes("schema cache") ||
    normalized.includes("relation") && normalized.includes("does not exist") ||
    normalized.includes("could not find the table");

  if (!isMissingTableError) {
    return false;
  }

  if (tableNames.length === 0) {
    return true;
  }

  return tableNames.some((tableName) => {
    const table = tableName.toLowerCase();
    return (
      normalized.includes(table) ||
      normalized.includes(`public.${table}`) ||
      normalized.includes(`\"${table}\"`) ||
      normalized.includes(`'public.${table}'`)
    );
  });
}

export function mapSupabaseErrorMessage(error: unknown): string {
  const { message, normalized, code } = getSupabaseErrorParts(error);

  if (isSupabaseMissingTableError(error, ["profiles"])) {
    return "Database setup is incomplete: missing public.profiles table. Run the latest Supabase migrations in your production project.";
  }

  if (isSupabaseMissingTableError(error, ["assessment_results"])) {
    return "Database setup is incomplete: missing public.assessment_results table. Run the latest Supabase migrations in your production project.";
  }

  if (isSupabaseMissingTableError(error)) {
    return "Database setup is incomplete: required Supabase tables are missing. Run the latest migrations in your production project.";
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
