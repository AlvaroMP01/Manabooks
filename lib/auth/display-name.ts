/**
 * Pull the Google display name from the Supabase JWT.
 *
 * Supabase stores OAuth user metadata (name, picture, etc.) under
 * `claims.user_metadata`. Google sends both `name` and `full_name`;
 * we prefer `full_name` when present and fall back to `name`.
 */

type ClaimsLike = Record<string, unknown> | null | undefined;

type MaybeUserMetadata = {
  full_name?: unknown;
  name?: unknown;
};

function readUserMetadata(claims: ClaimsLike): MaybeUserMetadata | null {
  if (!claims) return null;
  const meta = claims["user_metadata"];
  if (typeof meta !== "object" || meta === null) return null;
  return meta as MaybeUserMetadata;
}

export function extractDisplayName(claims: ClaimsLike): string | null {
  const meta = readUserMetadata(claims);
  if (!meta) return null;
  if (typeof meta.full_name === "string" && meta.full_name.trim().length > 0) {
    return meta.full_name.trim();
  }
  if (typeof meta.name === "string" && meta.name.trim().length > 0) {
    return meta.name.trim();
  }
  return null;
}

export function extractEmail(claims: ClaimsLike): string | null {
  if (!claims) return null;
  const email = claims["email"];
  return typeof email === "string" ? email : null;
}
