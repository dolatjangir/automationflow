"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { loginLeftPanel, loginFormContent } from "@/app/data/Loginpagedata";

const Login = () => {
  const router = useRouter();
  const { admin, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const { heading, description, features, highlightCard, illustration } = loginLeftPanel;
  const form = loginFormContent;

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    if (admin) router.push("/journey");
  }, [admin]);

  if (isLoading) {
    return (
      <div className="grid place-items-center h-screen w-full text-lg text-gray-600">
        Loading...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await login({ email, password });
    if (admin) router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="h-[100dvh] lg:h-screen overflow-hidden w-full grid lg:grid-cols-[1.15fr_1fr] bg-white dark:bg-[var(--color-secondary-darker)]">
      <Toaster position="top-right" />

      {/* ─────────────── LEFT PANEL (DESKTOP ONLY — UNCHANGED) ─────────────── */}
      <div className="relative hidden lg:flex h-screen min-h-0 flex-col justify-between overflow-hidden px-8 xl:px-12 py-[clamp(1rem,2.5vh,2rem)] bg-gradient-to-br from-[var(--color-primary-lighter)] via-[#eef3fd] to-white dark:from-[var(--color-secondary-darker)] dark:via-[var(--color-secondary-dark)] dark:to-[var(--color-secondary-darker)]">
        {/* decorative dotted grid */}
        <div
          className="pointer-events-none absolute top-8 right-8 h-20 w-20 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-primary-light) 1.5px, transparent 1.5px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* logo */}
        <div className="relative z-10 shrink-0">
         CRM
        </div>

        {/* main content + illustration */}
        <div className="relative z-10 min-h-0 flex-1 grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-center py-[clamp(0.5rem,2vh,1.5rem)]">
          <div className="min-h-0">
            <h1 className="text-[clamp(2.6rem,4.4vh,3.4rem)] leading-[1.15] font-extrabold text-[var(--color-secondary-darker)] dark:text-white">
              {heading.lineOne}
              <br />
              {heading.lineTwo}
              <span className="text-[var(--color-primary)]">
                {heading.highlight}
              </span>
            </h1>

            <div className="mt-[clamp(0.5rem,1.2vh,1rem)] h-1.5 w-14 rounded-full bg-[var(--color-primary)]" />

            <p className="mt-[clamp(0.75rem,2vh,1.5rem)] text-[clamp(0.8rem,1.7vh,0.95rem)] leading-relaxed text-gray-600 dark:text-gray-300 max-w-[420px]">
              {description}
            </p>

            {/* features */}
            <ul className="mt-[clamp(1rem,2.5vh,2rem)] space-y-[clamp(0.6rem,1.8vh,1.25rem)]">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex gap-3.5">
                    <span className="grid place-items-center shrink-0 h-[clamp(2rem,4.2vh,2.75rem)] w-[clamp(2rem,4.2vh,2.75rem)] rounded-full bg-white shadow-sm text-[var(--color-primary)]">
                      <Icon className="text-[clamp(1.8rem,2.8vh,2.1rem)]" />
                    </span>
                    <div>
                      <h3 className="text-[clamp(0.85rem,1.8vh,1rem)] font-semibold text-[var(--color-secondary-darker)] dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-[clamp(0.72rem,1.5vh,0.85rem)] text-gray-500 dark:text-gray-400 max-w-[300px] leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* illustration */}
          <div className="hidden 2xl:flex h-full min-h-0 items-center justify-center max-w-[400px]">
            <img
              src={illustration}
              alt="Login illustration"
              className="max-h-full w-full object-contain"
            />
          </div>
        </div>

        {/* highlight card */}
        <div className="relative z-10 shrink-0 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur shadow-sm px-5 py-[clamp(0.75rem,2vh,1.25rem)] flex items-center gap-6">
          <div className="flex items-start gap-3.5 max-w-[340px]">
            <span className="grid place-items-center shrink-0 h-[clamp(2rem,4.2vh,2.75rem)] w-[clamp(2rem,4.2vh,2.75rem)] rounded-full bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
              <highlightCard.icon className="text-[clamp(1.8rem,2.8vh,2.1rem)]" />
            </span>
            <div>
              <h3 className="text-[clamp(0.85rem,1.8vh,1rem)] font-semibold text-[var(--color-primary)]">
                {highlightCard.title}
              </h3>
              <p className="text-[clamp(0.72rem,1.5vh,0.85rem)] text-gray-500 dark:text-gray-400 leading-snug">
                {highlightCard.description}
              </p>
            </div>
          </div>

          <div className="flex flex-1 divide-x divide-gray-200 dark:divide-white/10">
            {highlightCard.stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex-1 text-center px-2">
                  <Icon className="mx-auto text-[var(--color-primary)] mb-0.5 text-[clamp(1.75rem,2.6vh,1.95rem)]" />
                  <p className="text-[clamp(0.9rem,2vh,1.15rem)] font-bold leading-tight text-[var(--color-secondary-darker)] dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-[clamp(0.65rem,1.4vh,0.75rem)] text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────── RIGHT PANEL ─────────────── */}
      <div className="relative flex flex-col items-center h-[100dvh] lg:h-screen overflow-hidden lg:overflow-y-auto px-0 lg:px-5 py-0 lg:py-8 bg-white dark:bg-[var(--color-secondary-darker)]">
        {/* ═══════════ MOBILE HEADER (mobile only, desktop untouched) ═══════════ */}
        <div className="lg:hidden relative w-full shrink-0 overflow-hidden rounded-b-[1.75rem] bg-gradient-to-br from-[var(--color-primary-lighter)] via-[#eef3fd] to-white dark:from-[var(--color-secondary-darker)] dark:via-[var(--color-secondary-dark)] dark:to-[var(--color-secondary-darker)] px-5 pt-[clamp(0.75rem,2.4dvh,1.1rem)] pb-[clamp(0.9rem,3dvh,1.4rem)]">
          {/* decorative dotted grid — same treatment as the desktop panel */}
          <div
            className="pointer-events-none absolute -top-2 -right-2 h-24 w-24 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(var(--color-primary-light) 1.5px, transparent 1.5px)",
              backgroundSize: "12px 12px",
            }}
          />

          {/* logo, top-left, original brand color — background is light so it just sits on it, no box, no filter */}
          <div className="relative z-10 flex items-center justify-start">
          </div>

          {/* illustration */}
          <div className="relative z-10 mt-[clamp(1.4rem,2.6dvh,1.75rem)] mb-5 flex justify-center">
           CRM
           
          </div>

          {/* tagline */}
          <h2 className="relative z-10 mt-[clamp(0.35rem,1.2dvh,0.6rem)] text-center text-[clamp(1rem,3dvh,1.25rem)] font-bold leading-snug text-[var(--color-secondary-darker)] dark:text-white">
            Log in to stay on top of
            <br />
            your tasks and projects.
          </h2>
        </div>

        <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center lg:justify-center px-5 lg:px-0 overflow-y-auto">
          <div className="w-full max-w-[480px] rounded-3xl lg:rounded-3xl bg-white dark:bg-white/5 lg:shadow-[0_10px_40px_rgba(15,23,42,0.08)] px-1 sm:px-8 lg:px-8 py-[clamp(0.6rem,2dvh,1.5rem)] lg:py-[clamp(1.25rem,4vh,2.25rem)]">
            {/* lock badge — desktop only, mobile already shows illustration above */}
            <div className="hidden lg:grid place-items-center">
              <span className="grid place-items-center h-[clamp(2.75rem,6vh,4rem)] w-[clamp(2.75rem,6vh,4rem)] rounded-full bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                <FaLock className="text-[clamp(0.9rem,2.2vh,1.25rem)]" />
              </span>
            </div>

            <h2 className="mt-0 lg:mt-[clamp(0.6rem,1.8vh,1.25rem)] text-center text-[clamp(1.15rem,3dvh,1.9rem)] lg:text-[clamp(1.35rem,3.2vh,1.9rem)] font-bold text-[var(--color-secondary-darker)] dark:text-white">
              {form.title}
            </h2>
            <p className="mt-1 text-center text-[clamp(0.7rem,1.4dvh,0.875rem)] lg:text-[clamp(0.75rem,1.6vh,0.875rem)] text-gray-500 dark:text-gray-400">
              {form.subtitle}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-[clamp(0.65rem,2dvh,2rem)] lg:mt-[clamp(1rem,2.8vh,2rem)] flex flex-col gap-[clamp(0.55rem,1.6dvh,1.25rem)] lg:gap-[clamp(0.75rem,2vh,1.25rem)]"
            >
              {/* email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-1.5 text-[clamp(0.72rem,1.4dvh,0.875rem)] lg:text-[clamp(0.75rem,1.6vh,0.875rem)] font-semibold text-[var(--color-secondary-darker)] dark:text-gray-200"
                >
                  {form.emailLabel}
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-[var(--color-primary-light)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary-lighter)] transition px-3 py-[clamp(0.4rem,1.3dvh,0.75rem)] lg:py-[clamp(0.5rem,1.4vh,0.75rem)]">
                  <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-[var(--color-primary-lighter)] text-[var(--color-primary)]">
                    <FaEnvelope className="text-sm" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={form.emailPlaceholder}
                    className="w-full bg-transparent outline-none text-[var(--color-secondary-darker)] dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-1.5 text-[clamp(0.72rem,1.4dvh,0.875rem)] lg:text-[clamp(0.75rem,1.6vh,0.875rem)] font-semibold text-[var(--color-secondary-darker)] dark:text-gray-200"
                >
                  {form.passwordLabel}
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 dark:bg-white/5 focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary-lighter)] transition px-3 py-[clamp(0.4rem,1.3dvh,0.75rem)] lg:py-[clamp(0.5rem,1.4vh,0.75rem)]">
                  <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-500">
                    <FaLock className="text-sm" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={form.passwordPlaceholder}
                    className="w-full bg-transparent outline-none text-[var(--color-secondary-darker)] dark:text-white placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-gray-400 hover:text-[var(--color-primary)] cursor-pointer transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* remember + forgot */}
              {/* <div className="flex items-center justify-between text-[clamp(0.75rem,1.6vh,0.875rem)]">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--color-primary)] cursor-pointer"
                />
                {form.rememberLabel}
              </label>
              <Link
                href={form.forgotHref}
                className="text-[var(--color-primary)] hover:underline"
              >
                {form.forgotLabel}
              </Link>
            </div> */}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer flex items-center justify-center gap-2 py-[clamp(0.5rem,1.6dvh,0.9rem)] lg:py-[clamp(0.6rem,1.7vh,0.9rem)] rounded-xl text-white font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary-darker)] shadow-lg shadow-[var(--color-primary-lighter)] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FaLock className="text-sm" />
                {loading ? form.submitLoadingLabel : form.submitLabel}
              </button>
            </form>

            {/* divider */}
            <div className="my-[clamp(0.5rem,1.6dvh,1.5rem)] lg:my-[clamp(0.75rem,2.2vh,1.5rem)] flex items-center gap-4">
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              <span className="text-sm text-gray-400">{form.dividerLabel}</span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            </div>

            {/* register */}
            <Link
              href={form.registerHref}
              className="flex items-center justify-center gap-2 w-full py-[clamp(0.5rem,1.6dvh,0.9rem)] lg:py-[clamp(0.6rem,1.7vh,0.9rem)] rounded-xl border border-gray-200 dark:border-white/10 text-[clamp(0.72rem,1.4dvh,0.875rem)] lg:text-[clamp(0.75rem,1.6vh,0.875rem)] text-gray-600 dark:text-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
            >
              <FaUserPlus className="text-gray-400" />
              <span>
                {form.registerPrompt}{" "}
                <span className="text-[var(--color-primary)] font-semibold">
                  {form.registerLabel}
                </span>
              </span>
            </Link>
          </div>

          {/* footer */}
          <div className="mt-[clamp(0.4rem,1.4dvh,2rem)] lg:mt-[clamp(1rem,2.5vh,2rem)] text-center space-y-1 shrink-0">
            <p className="flex items-center justify-center gap-2 text-[10px] lg:text-xs text-gray-400">
              <FaShieldAlt className="text-[var(--color-primary-light)]" />
              {form.securityNote}
            </p>
            <p className="hidden lg:block text-xs text-gray-400">
              &copy; {currentYear}{" "}
              <span className="text-[var(--color-primary)] font-medium">
                {form.brandName}
              </span>
              . {form.copyrightSuffix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;