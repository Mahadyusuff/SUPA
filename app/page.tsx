import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { EnvVarWarning } from "@/components/env-var-warning";
import { NameForm } from "@/components/name-form";
import { SurnameCard } from "@/components/surname-card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";

type UserEntry = {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
};

async function NameHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-muted-foreground text-sm">
        No names saved yet. Enter your name above to discover your
        surname&apos;s history and family crest.
      </p>
    );
  }

  const { data } = await supabase
    .from("users")
    .select("id, first_name, last_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const history = (data as UserEntry[]) ?? [];

  if (history.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No names saved yet. Enter your name above to discover your
        surname&apos;s history and family crest.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {history.map((entry) => (
        <SurnameCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border p-6 flex gap-6 animate-pulse">
          <div className="w-20 h-24 bg-muted rounded flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-5 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
            <div className="h-3 bg-muted rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Family Crest Explorer</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="flex-1 flex flex-col gap-12 w-full max-w-5xl p-5">
          <div>
            <h1 className="font-bold text-3xl mb-2">Family Crest Explorer</h1>
            <p className="text-muted-foreground">
              Enter your name to discover your surname&apos;s history and family
              crest.
            </p>
          </div>

          <NameForm />

          <div>
            <h2 className="font-bold text-2xl mb-6">Name History</h2>
            <Suspense fallback={<HistorySkeleton />}>
              <NameHistory />
            </Suspense>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
