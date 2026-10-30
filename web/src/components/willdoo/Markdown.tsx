import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { isSafeMondayUrl } from "../../lib/links";

/**
 * Minimal Markdown for Will's answers: paragraphs, lists, **bold**, `code`
 * and [links](…). No HTML is ever interpreted. Links are rendered only to
 * routes of this app (/…) or to monday.com; anything else stays as text, so
 * a link planted in the data cannot send the user elsewhere.
 */
export function isSafeWillDooLink(href: string): boolean {
  return (/^\/(?!\/)[^\s\\]*$/.test(href) && !href.includes("..")) || isSafeMondayUrl(href);
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={index} className="rounded-[6px] bg-n-50 px-1 py-px text-[0.92em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link as unknown as [string, string, string];
      if (!isSafeWillDooLink(href)) return <Fragment key={index}>{label}</Fragment>;
      const className = "font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-600";
      return href.startsWith("/") ? (
        <Link key={index} to={href} className={className}>
          {label}
        </Link>
      ) : (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {label}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={blocks.length}>
          {paragraph.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      );
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      const Tag = list.ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={blocks.length} className={list.ordered ? "list-decimal space-y-1 pl-5" : "list-disc space-y-1 pl-5"}>
          {list.items.map((item, index) => (
            <li key={index}>{inline(item)}</li>
          ))}
        </Tag>
      );
      list = null;
    }
  };

  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]!);
    } else if (heading) {
      flushParagraph();
      flushList();
      blocks.push(
        <p key={blocks.length} className="font-bold">
          {inline(heading[1]!)}
        </p>
      );
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  return <div className="space-y-2 break-words">{blocks}</div>;
}
