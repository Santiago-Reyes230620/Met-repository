type UserDisplayInput = {
  fullName?: string | null;
  metadataFullName?: string | null;
  email?: string | null;
};

const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ");

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const emailPrefixToName = (email: string) => {
  const prefix = email.split("@")[0] ?? "";
  if (!prefix) return "";

  return toTitleCase(prefix.replace(/[._-]+/g, " "));
};

export const getUserDisplayName = ({ fullName, metadataFullName, email }: UserDisplayInput): string => {
  const candidates = [fullName, metadataFullName]
    .map((value) => (typeof value === "string" ? normalizeWhitespace(value) : ""))
    .filter(Boolean);

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (typeof email === "string") {
    const fromEmail = emailPrefixToName(email.trim().toLowerCase());
    if (fromEmail) return fromEmail;
  }

  return "Student";
};

export const getUserFirstName = (displayName: string): string => {
  const normalized = normalizeWhitespace(displayName);
  return normalized.split(" ")[0] || "Student";
};

export const getUserInitial = (displayName: string): string => {
  const normalized = normalizeWhitespace(displayName);
  const first = normalized.charAt(0).toUpperCase();
  return first || "U";
};
