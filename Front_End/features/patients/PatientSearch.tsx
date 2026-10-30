"use client";

import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { inputClass, selectClass } from "@/components/ui/form";
import {
  MAX_PATIENT_AGE,
  hasActiveFilters,
  parseAge,
  parseGender,
  patientsHref,
  type PatientListFilters,
} from "@/lib/patients-url";
import { normalizeDigits } from "@/lib/utils";
import type { PatientSort } from "@/types/api";

export function PatientSearch({
  initial,
  sort,
  placeholder,
  label,
  clearLabel,
}: {
  initial: PatientListFilters;
  sort: PatientSort;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  const t = useTranslations("patients");
  const router = useRouter();
  const [value, setValue] = useState(initial.search);
  const [gender, setGender] = useState(initial.gender);
  const [minAge, setMinAge] = useState(initial.minAge?.toString() ?? "");
  const [maxAge, setMaxAge] = useState(initial.maxAge?.toString() ?? "");
  const mounted = useRef(false);
  // URLs this component pushed itself and has not yet seen come back through initial.
  const pushed = useRef(new Set<string>());
  const initialHref = patientsHref(initial, sort);

  const navigate = (next: PatientListFilters) => {
    const href = patientsHref(next, sort);
    pushed.current.add(href);
    router.replace(href);
  };

  // A URL we did not push (back button, sidebar link, "clear" link) resets the inputs to match it.
  // Remounting instead would steal focus while the user is typing.
  useEffect(() => {
    if (pushed.current.delete(initialHref)) {
      return;
    }
    setValue(initial.search);
    setGender(initial.gender);
    setMinAge(initial.minAge?.toString() ?? "");
    setMaxAge(initial.maxAge?.toString() ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialHref]);

  const current = (): PatientListFilters => {
    const min = parseAge(minAge);
    const max = parseAge(maxAge);
    return {
      search: value.trim(),
      gender: parseGender(gender),
      minAge: min,
      // An inverted range would be rejected by the API; keep the lower bound only.
      maxAge: min !== undefined && max !== undefined && max < min ? undefined : max,
    };
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const timer = setTimeout(() => navigate(current()), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, gender, minAge, maxAge]);

  const clearAll = () => {
    setValue("");
    setGender("");
    setMinAge("");
    setMaxAge("");
    navigate({ search: "", gender: "" });
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(current());
      }}
      className="space-y-3"
    >
      <div className="relative">
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
            onClick={() => setValue("")}
            aria-label={clearLabel}
            className="absolute inset-y-0 end-2 my-auto grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-foreground"
          >
            <FiX aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full space-y-1 sm:w-44">
          <label htmlFor="patient-filter-gender" className="block text-[11px] font-bold text-muted">
            {t("filters.gender")}
          </label>
          <select
            id="patient-filter-gender"
            value={gender}
            onChange={(event) => setGender(parseGender(event.target.value))}
            className={selectClass}
          >
            <option value="">{t("filters.allGenders")}</option>
            <option value="female">{t("gender.female")}</option>
            <option value="male">{t("gender.male")}</option>
            <option value="unspecified">{t("gender.unspecified")}</option>
          </select>
        </div>

        <div className="w-[calc(50%-0.375rem)] space-y-1 sm:w-28">
          <label htmlFor="patient-filter-min-age" className="block text-[11px] font-bold text-muted">
            {t("filters.minAge")}
          </label>
          <input
            id="patient-filter-min-age"
            inputMode="numeric"
            maxLength={3}
            value={minAge}
            onChange={(event) => setMinAge(normalizeDigits(event.target.value).replace(/\D/g, ""))}
            placeholder="0"
            aria-describedby="patient-filter-age-hint"
            className={inputClass}
          />
        </div>

        <div className="w-[calc(50%-0.375rem)] space-y-1 sm:w-28">
          <label htmlFor="patient-filter-max-age" className="block text-[11px] font-bold text-muted">
            {t("filters.maxAge")}
          </label>
          <input
            id="patient-filter-max-age"
            inputMode="numeric"
            maxLength={3}
            value={maxAge}
            onChange={(event) => setMaxAge(normalizeDigits(event.target.value).replace(/\D/g, ""))}
            placeholder={String(MAX_PATIENT_AGE)}
            aria-describedby="patient-filter-age-hint"
            className={inputClass}
          />
        </div>

        <p id="patient-filter-age-hint" className="sr-only">
          {t("filters.ageHint", { max: MAX_PATIENT_AGE })}
        </p>

        {hasActiveFilters(current()) ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-muted transition hover:text-foreground"
          >
            <FiX aria-hidden="true" className="size-3.5" />
            {t("filters.clear")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
