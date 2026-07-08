"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserAuth } from "@/lib/supabase/browser-auth";

/**
 * Magic-link landing page. Supabase's verify endpoint redirects here with the
 * session in the URL fragment (implicit flow) — the fragment never reaches any
 * server or log. The tokens are stored into cookies via the auth browser
 * client, then replaced out of history.
 */
export default function AuthCallbackPage() {
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const errorDescription = params.get("error_description");

    if (!access_token || !refresh_token) {
      setFailed(errorDescription ?? "The login link is invalid or has expired.");
      return;
    }

    supabaseBrowserAuth()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setFailed(error.message);
        } else {
          // replace() keeps the token-bearing URL out of browser history.
          window.location.replace("/admin");
        }
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5 py-10 text-center">
      {failed ? (
        <>
          <p role="alert" className="font-medium text-outofstock">
            {failed}
          </p>
          <a href="/admin/login" className="mt-4 underline">
            Request a new link
          </a>
        </>
      ) : (
        <p className="text-ink-soft">Signing you in…</p>
      )}
    </main>
  );
}
