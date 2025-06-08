"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    window.location.href = "/dashboard";
  }, [router]);

  return (
    <div className="flex h-screen w-full place-items-center">
      <p className="text-3xl font-semibold text-black">
        Redirecting to your scheduler...
      </p>
    </div>
  );
}
