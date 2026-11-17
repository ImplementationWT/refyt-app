import type { FeedbackStatus, FeedbackType } from "./types";
import type { Tone } from "./utils";

export const FEEDBACK_SETTINGS_KEY = ["feedback-settings"] as const;
export const FEEDBACK_KEY = ["feedback"] as const;

export const FEEDBACK_TYPES: Record<FeedbackType, { label: string; tone: Tone; hint: string }> = {
  bug: { label: "Something isn’t working", tone: "red", hint: "An error, or something that does not work as expected" },
  idea: { label: "Improvement or idea", tone: "violet", hint: "Something that would make your work easier" },
  question: { label: "Question", tone: "blue", hint: "Something you are not sure how to do" }
};

export const FEEDBACK_STATUSES: Record<FeedbackStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "amber" },
  in_progress: { label: "In progress", tone: "blue" },
  fixed: { label: "Fixed", tone: "green" },
  wont_fix: { label: "Won't fix", tone: "neutral" }
};
