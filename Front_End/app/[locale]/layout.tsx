import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    title: {
      default: isArabic
        ? "نظام السجلات الطبية الذكية"
        : "Smart Medical Records System",
      template: isArabic
        ? "%s | السجلات الطبية الذكية"
        : "%s | Smart Medical Records",
    },
    description: isArabic
      ? "منصة آمنة لإدارة السجلات الطبية للأطباء والسكرتارية ومديري النظام، تشمل المرضى والزيارات والتشخيص والوصفات والمستندات والمواعيد."
      : "A secure medical records platform for doctors, secretaries, and administrators to manage patients, visits, diagnoses, prescriptions, medical documents, and appointments.",
    keywords: isArabic
      ? [
          "السجلات الطبية الذكية",
          "نظام إدارة السجلات الطبية",
          "السجلات الصحية الإلكترونية",
          "إدارة المرضى",
          "الزيارات الطبية",
          "إدارة التشخيص",
          "الوصفات الطبية",
          "التاريخ الطبي",
          "إدارة المواعيد",
          "لوحة تحكم الطبيب",
          "نظام الرعاية الصحية الآمن",
        ]
      : [
          "smart medical records",
          "medical records system",
          "electronic health records",
          "patient management",
          "medical visits",
          "diagnosis management",
          "prescriptions",
          "medical timeline",
          "appointment management",
          "doctor dashboard",
          "secure healthcare system",
        ],
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className={cairo.variable}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
