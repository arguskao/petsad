import { normalizeEmail, type PublicMember } from './auth';

export const ADMIN_EMAIL_ALLOWLIST_ENV = 'ADMIN_EMAIL_ALLOWLIST';

export const parseAdminEmailAllowlist = (value: string | null | undefined) => {
  const entries = String(value || '')
    .split(/[\s,;]+/)
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);

  return new Set(entries);
};

export const isAdminEmailAllowed = (email: string, allowlistValue: string | null | undefined) => {
  const allowlist = parseAdminEmailAllowlist(allowlistValue);
  return allowlist.has(normalizeEmail(email));
};

export const getAdminAccessState = (
  member: PublicMember | null,
  allowlistValue: string | null | undefined,
) => {
  if (!member) {
    return {
      allowed: false,
      reason: 'not_logged_in' as const,
    };
  }

  const allowlist = parseAdminEmailAllowlist(allowlistValue);
  if (!allowlist.size) {
    return {
      allowed: false,
      reason: 'missing_allowlist' as const,
      member,
    };
  }

  if (!allowlist.has(normalizeEmail(member.email))) {
    return {
      allowed: false,
      reason: 'forbidden' as const,
      member,
    };
  }

  return {
    allowed: true,
    member,
  };
};
