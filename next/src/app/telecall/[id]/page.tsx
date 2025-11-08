"use client";

import dynamic from "next/dynamic";
import React from "react";

// ✅ Lazy-load TelecallClient, disabling SSR
const TelecallClient = dynamic(() => import("./TelecallClient"), { ssr: false });

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // ✅ Unwrap the promise using React.use()
  const { id } = React.use(params);

  return <TelecallClient id={id} />;
}
