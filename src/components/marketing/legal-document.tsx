import { PageHero } from "@/components/marketing/primitives";
import { Link } from "@/i18n/navigation";
import type { LegalBlock, LegalDoc, LegalDocKey } from "@/lib/legal";
import { legalTokenValue, SITE, type LegalToken } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, FileText, Mail } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

const INTERNAL_PATHS = ["/privacy", "/terms", "/cookies", "/contact", "/pricing"] as const;
type InternalPath = (typeof INTERNAL_PATHS)[number];

const RELATED: Record<LegalDocKey, InternalPath[]> = {
  privacy: ["/terms", "/cookies"],
  terms: ["/privacy", "/cookies"],
  cookies: ["/privacy", "/terms"],
};

const INLINE_PATTERN =
  /\{(\w+)\}|\[([^\]]+)\]\((\/[a-z-]+)\)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,})|\*\*(.+?)\*\*/g;

type RenderContext = { todoLabel: (token: string) => string };

function renderInline(text: string, ctx: RenderContext): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const [whole, token, label, href, email, strong] = match;
    const key = `${start}-${index++}`;

    if (token) {
      const value = legalTokenValue(token as LegalToken);
      nodes.push(
        value === null ? (
          <mark
            key={key}
            className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[0.85em] font-semibold text-amber-900 ring-1 ring-amber-200"
          >
            {ctx.todoLabel(token)}
          </mark>
        ) : value.includes("@") ? (
          <a key={key} href={`mailto:${value}`} dir="ltr" className="font-medium text-primary hover:underline">
            {value}
          </a>
        ) : (
          <span key={key}>{value}</span>
        ),
      );
    } else if (label && href && (INTERNAL_PATHS as readonly string[]).includes(href)) {
      nodes.push(
        <Link key={key} href={href as InternalPath} className="font-medium text-primary hover:underline">
          {label}
        </Link>,
      );
    } else if (strong) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-950">
          {renderInline(strong, ctx)}
        </strong>,
      );
    } else if (email) {
      nodes.push(
        <a key={key} href={`mailto:${email}`} dir="ltr" className="font-medium text-primary hover:underline">
          {email}
        </a>,
      );
    } else {
      nodes.push(whole);
    }
    last = start + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function Block({ block, ctx }: { block: LegalBlock; ctx: RenderContext }) {
  if ("p" in block) {
    return <p>{renderInline(block.p, ctx)}</p>;
  }
  if ("h" in block) {
    return <h3 className="!mt-8 text-base font-semibold text-slate-950">{renderInline(block.h, ctx)}</h3>;
  }
  if ("ul" in block) {
    return (
      <ul className="space-y-2.5 ps-1">
        {block.ul.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
            <span>{renderInline(item, ctx)}</span>
          </li>
        ))}
      </ul>
    );
  }
  if ("note" in block) {
    return (
      <p className="rounded-2xl border border-primary/15 bg-primary/[0.04] px-5 py-4 text-[0.9375rem] text-slate-700">
        {renderInline(block.note, ctx)}
      </p>
    );
  }
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-slate-200 text-start text-sm">
        <thead>
          <tr className="bg-slate-50">
            {block.table.head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="border-b border-slate-200 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, r) => (
            <tr key={r} className="align-top">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    "border-b border-slate-100 px-4 py-3 text-slate-700",
                    c === 0 && "font-mono text-[13px] font-medium text-slate-900",
                  )}
                  dir={c === 0 ? "ltr" : undefined}
                >
                  {renderInline(cell, ctx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function LegalDocument({
  docKey,
  doc,
  locale,
}: {
  docKey: LegalDocKey;
  doc: LegalDoc;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "marketing.legal" });
  const format = await getFormatter({ locale });
  const ctx: RenderContext = { todoLabel: (token) => t("todo", { item: t(`tokens.${token}`) }) };
  const updated = format.dateTime(new Date(`${SITE.legalLastUpdated}T00:00:00Z`), {
    dateStyle: "long",
    timeZone: "UTC",
  });

  return (
    <>
      <PageHero compact eyebrow={doc.eyebrow} title={doc.title} lead={doc.lead}>
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
          <FileText className="size-4" aria-hidden />
          {t("lastUpdated", { date: updated })}
        </p>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        {SITE.legalReviewPending ? (
          <div
            role="note"
            className="mx-auto mb-10 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 lg:max-w-none"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{t("reviewPending")}</p>
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
          <nav aria-label={t("onThisPage")} className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t("onThisPage")}
              </p>
              <ol className="mt-4 space-y-1 border-s border-slate-200">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ms-px block border-s border-transparent py-1.5 ps-4 text-[13px] leading-snug text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-900"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="min-w-0 max-w-3xl">
            <section
              aria-labelledby="legal-summary"
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_48px_-40px_rgba(30,27,75,0.35)] sm:p-8"
            >
              <h2 id="legal-summary" className="text-base font-semibold text-slate-950">
                {doc.summary.title}
              </h2>
              <ul className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-slate-700">
                {doc.summary.items.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-100">
                      ✓
                    </span>
                    <span>{renderInline(item, ctx)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <details className="mt-6 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                {t("onThisPage")}
              </summary>
              <ol className="mt-3 space-y-2 pb-2 text-sm text-slate-600">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="hover:text-slate-950">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            <div className="mt-12 space-y-14">
              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-4 text-[0.9375rem] leading-[1.75] text-slate-700">
                    {section.blocks.map((block, i) => (
                      <Block key={i} block={block} ctx={ctx} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[#0b0a2e] p-6 text-white sm:col-span-2 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-base font-semibold">{t("questions.title")}</p>
                  <p className="mt-1.5 text-sm text-indigo-100/75">{t("questions.body")}</p>
                </div>
                <a
                  href={`mailto:${SITE.privacyEmail}`}
                  dir="ltr"
                  className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-indigo-50 sm:mt-0"
                >
                  <Mail className="size-4" aria-hidden />
                  {SITE.privacyEmail}
                </a>
              </div>
              {RELATED[docKey].map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-sm font-semibold text-slate-900 transition-colors hover:border-slate-300"
                >
                  {t(`related.${href.slice(1)}`)}
                  <ArrowRight
                    className="size-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
