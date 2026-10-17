import type { ReactNode } from "react";

export function EditorialPageHeader({
  title,
  description,
  aside,
  align = "left",
}: {
  title: string;
  description: string;
  aside?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <header className={`border-b-2 border-stone-900 pb-5 ${align === "center" ? "text-center" : ""}`}>
      {aside && <div className="mb-2 flex justify-end">{aside}</div>}
      <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight tracking-[-0.025em] text-stone-950 sm:text-5xl">
        {title}
      </h1>
      <p className={`mt-3 max-w-[68ch] text-sm leading-relaxed text-stone-600 sm:text-base ${align === "center" ? "mx-auto" : ""}`}>
        {description}
      </p>
    </header>
  );
}
