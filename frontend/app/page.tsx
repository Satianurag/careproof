"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheckIcon,
  LockIcon,
  EyeOffIcon,
  FileCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: <LockIcon className="size-6" />,
    title: "Zero-Knowledge Proofs",
    description:
      "Verify healthcare credentials without revealing sensitive patient data using Midnight Network ZK technology.",
  },
  {
    icon: <EyeOffIcon className="size-6" />,
    title: "Privacy-First Design",
    description:
      "Only commitment hashes are stored on-chain. Patients prove credential ownership without revealing any medical data.",
  },
  {
    icon: <FileCheckIcon className="size-6" />,
    title: "Tamper-Proof Credentials",
    description:
      "Credentials are hashed and stored on-chain in a Merkle tree, making forgery computationally impossible.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />

      <nav className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheckIcon className="size-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CareProof</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs tracking-wider">
            {process.env.NEXT_PUBLIC_NETWORK_NAME || "Preview Testnet"}
          </Badge>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="mb-20 text-center">
          <Badge variant="outline" className="mb-6 animate-pulse border-primary/30 text-primary">
            Powered by Zero-Knowledge Cryptography
          </Badge>
          <h1 className="mb-6 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent lg:text-7xl">
            Privacy-Preserving
            <br />
            Healthcare Credentials
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Issue, disclose, and verify medical credentials with complete
            privacy. Built on Midnight Network&apos;s zero-knowledge proof
            infrastructure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2 px-8" onClick={() => router.push("/login")}>
              Launch App
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                window.open("https://midnight.network", "_blank")
              }
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="grid w-full gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://midnight.network"
              className="font-medium text-primary transition-colors hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Midnight Network
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
