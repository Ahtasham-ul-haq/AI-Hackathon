"use client";

import { useState } from "react";

/** Source photo credited to the outlet. Broken images disappear (no placeholder). */
export function StoryImage({ src, credit, large }: { src: string; credit: string | null; large?: boolean }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  return (
    <figure className="mb-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote outlet images, any host */}
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={`w-full object-cover grayscale-[15%] ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`}
      />
      {credit && <figcaption className="mt-1 text-[11px] uppercase tracking-wide text-stone-500">Photo: {credit}</figcaption>}
    </figure>
  );
}
