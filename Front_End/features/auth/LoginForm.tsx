"use client";

import { useActionState, useState } from "react";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { loginAction, type AuthActionState } from "@/data/auth/actions";

const INITIAL_STATE: AuthActionState = {};

interface LoginFormProps {
  demoMode: boolean;
}

export function LoginForm({ demoMode }: LoginFormProps) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fillDemo = (role: "secretary" | "doctor") => {
    if (role === "secretary") {
      setEmail("secretary@medilog.local");
      setPassword("Secretary123!");
      return;
    }
    setEmail("doctor@medilog.local");
    setPassword("Doctor123!");
  };

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold">
          {t("auth.email")}
        </label>
        <div className="relative">
          <FiMail
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("auth.emailPlaceholder")}
            className="h-11 w-full rounded-xl border border-border bg-surface-2 ps-10 pe-3 text-sm outline-none transition placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold">
          {t("auth.password")}
        </label>
        <div className="relative">
          <FiLock
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
            className="h-11 w-full rounded-xl border border-border bg-surface-2 ps-10 pe-11 text-sm outline-none transition placeholder:text-muted/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={
              showPassword ? t("auth.hidePassword") : t("auth.showPassword")
            }
            className="absolute inset-y-0 end-2 my-auto grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-foreground"
          >
            {showPassword ? (
              <FiEyeOff aria-hidden="true" className="size-4" />
            ) : (
              <FiEye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {t(state.error)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-[#04211e] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? t("auth.submitting") : t("auth.submit")}
        <FiArrowRight
          aria-hidden="true"
          className="size-4 rtl:-scale-x-100"
        />
      </button>

      {demoMode ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-2/60 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            {t("auth.demoTitle")}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {t("auth.demoHint")}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => fillDemo("secretary")}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-start text-xs transition hover:border-primary/50"
            >
              <span className="block font-semibold">
                {t("auth.demoSecretary")}
              </span>
              <span className="block text-muted" dir="ltr">
                secretary@medilog.local
              </span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("doctor")}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-start text-xs transition hover:border-primary/50"
            >
              <span className="block font-semibold">
                {t("auth.demoDoctor")}
              </span>
              <span className="block text-muted" dir="ltr">
                doctor@medilog.local
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
