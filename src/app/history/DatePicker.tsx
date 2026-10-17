"use client";

import { useRouter } from "next/navigation";

export function DatePicker({ min, max }: { min?: string; max?: string }) {
  const router = useRouter();
  return (
    <label className="mt-6 flex items-center gap-3 text-sm">
      <span className="font-medium">Go to a date</span>
      <input
        type="date"
        min={min}
        max={max}
        onChange={(e) => e.target.value && router.push(`/paper/${e.target.value}`)}
        className="rounded border border-stone-300 bg-white px-2 py-1"
      />
    </label>
  );
}
