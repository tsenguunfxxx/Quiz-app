import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/button-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <Sparkles className="size-4 text-primary" />
          <span>Article Quiz Generator</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Show when="signed-in">
            <ButtonLink variant="ghost" size="sm" href="/dashboard">
              Нүүр
            </ButtonLink>
            <ButtonLink variant="ghost" size="sm" href="/history">
              Түүх
            </ButtonLink>
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="sm">Нэвтрэх</Button>
            </SignInButton>
          </Show>
        </nav>
      </div>
    </header>
  );
}
