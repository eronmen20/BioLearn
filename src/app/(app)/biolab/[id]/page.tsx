"use client";

import { useEffect, useState } from "react";
import { BioLabDetail } from "@/components/sections/biolab-view";

export default function BioLabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  if (!id) return <div className="min-h-[80vh]" />;
  return <BioLabDetail key={id} id={id} />;
}
