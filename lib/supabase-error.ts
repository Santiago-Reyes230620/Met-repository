export function mapSupabaseErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : "Unexpected database error";
  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes("could not find the table 'public.profiles'") ||
    normalized.includes("relation \"public.profiles\" does not exist") ||
    normalized.includes("relation \"profiles\" does not exist")
  ) {
    return "Database setup is incomplete: missing public.profiles table. Run the latest Supabase migrations in your production project.";
  }

  return rawMessage;
}
