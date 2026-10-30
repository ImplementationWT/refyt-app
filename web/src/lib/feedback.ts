import type { FeedbackStatus, FeedbackType } from "./types";
import type { Tone } from "./utils";

export const FEEDBACK_SETTINGS_KEY = ["feedback-settings"] as const;
export const FEEDBACK_KEY = ["feedback"] as const;

export const FEEDBACK_TYPES: Record<FeedbackType, { label: string; tone: Tone; hint: string }> = {
  bug: { label: "Something is wrong", tone: "red", hint: "An error, or something that does not work as expected" },
  idea: { label: "Idea", tone: "violet", hint: "Something that would make your work easier" },
  question: { label: "Question", tone: "blue", hint: "Something you are not sure how to do" }
};

export const FEEDBACK_STATUSES: Record<FeedbackStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "amber" },
  in_progress: { label: "In progress", tone: "blue" },
  fixed: { label: "Fixed", tone: "green" },
  wont_fix: { label: "Won't fix", tone: "neutral" }
};

/** Where the user is: the Refyt app and page title on screen, so the team can find it. */
export function currentScreen(): string | undefined {
  const app = document.querySelector(".rf-appdd .rf-adn b")?.textContent?.trim();
  // Refyt keeps the pages of the other apps in the DOM, hidden: take the visible title.
  const title = [...document.querySelectorAll<HTMLElement>(".op h1, main h1")]
    .find((heading) => heading.getClientRects().length > 0)
    ?.textContent?.trim();
  const parts = [app, title].filter((part): part is string => Boolean(part));
  return parts.length ? [...new Set(parts)].join(" · ").slice(0, 200) : undefined;
}
