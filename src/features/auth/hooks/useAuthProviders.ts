"use client";

import { useEffect, useState } from "react";

export interface AuthProviders {
  google: boolean;
  apple: boolean;
}

const NONE: AuthProviders = { google: false, apple: false };
let cached: Promise<AuthProviders> | null = null;

/**
 * Which OAuth providers the Supabase project actually has switched on —
 * read from Auth's public settings endpoint. A provider that isn't enabled
 * would otherwise send people to a raw JSON error page, so its button is
 * simply not shown. Fetched once per page load.
 */
function fetchProviders(): Promise<AuthProviders> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return Promise.resolve(NONE);
  cached ??= fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    .then((response) => (response.ok ? response.json() : null))
    .then((settings: { external?: Partial<AuthProviders> } | null) => ({
      google: Boolean(settings?.external?.google),
      apple: Boolean(settings?.external?.apple),
    }))
    .catch(() => {
      cached = null; // offline: try again next time
      return NONE;
    });
  return cached;
}

/** null while loading. */
export function useAuthProviders(): AuthProviders | null {
  const [providers, setProviders] = useState<AuthProviders | null>(null);
  useEffect(() => {
    let active = true;
    void fetchProviders().then((result) => {
      if (active) setProviders(result);
    });
    return () => {
      active = false;
    };
  }, []);
  return providers;
}
