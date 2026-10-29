"use client";

import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useRouter } from "@/i18n/navigation";
import type { PatientSort } from "@/types/api";

export function PatientSearch({
  initial,
  sort,
  placeholder,
  label,
  clearLabel,
}: {
  initial: string;
  sort: PatientSort;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const mounted = useRef(false);

  const navigate = (next: string) => {
    const params = new URLSearchParams();
    if (next.trim()) params.set("q", next.trim());
    if (sort !== "lastVisit_desc") params.set("sort", sort);
    const query = params.toString();
    router.replace(`/patients${query ? `?${query}` : ""}`);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const timer = setTimeout(() => navigate(value), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(value);
      }}
      className="relative"
    >
      <label htmlFor="patient-search" className="sr-only">
        {label}
      </label>
      <FiSearch
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
      />
      <input
        id="patient-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-border bg-surface ps-10 pe-10 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            navigate("");
          }}
          aria-label={clearLabel}
          className="absolute inset-y-0 end-2 my-auto grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-foreground"
        >
          <FiX aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </form>
  );
}
