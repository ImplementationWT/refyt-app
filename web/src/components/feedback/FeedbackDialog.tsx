import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router";
import { api, ApiError } from "../../lib/api";
import { currentScreen, FEEDBACK_SETTINGS_KEY, FEEDBACK_TYPES } from "../../lib/feedback";
import type { Feedback, FeedbackType } from "../../lib/types";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Dialog, DialogFooter } from "../ui/dialog";
import { Field, Textarea } from "../ui/form";
import { useToast } from "../ui/toast";

const MIN_LENGTH = 3;

/**
 * Lets any signed-in user tell the implementation team about a problem, an idea or a doubt. The
 * page and the Refyt screen they are on travel with the message. Rendered in document.body so the
 * Refyt header styles do not reach it.
 */
export function FeedbackDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [type, setType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setError(null);
    onClose();
  };

  const send = useMutation({
    mutationFn: () =>
      api<{ feedback: Feedback }>("/api/feedback", {
        method: "POST",
        body: { type, message: message.trim(), page: location.pathname, screen: currentScreen() }
      }),
    onSuccess: () => {
      setMessage("");
      setType("bug");
      close();
      toast({ tone: "success", message: "Thanks! Your feedback reached the implementation team" });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "feedback_disabled") {
        setError("Feedback was just switched off by an administrator.");
        void queryClient.invalidateQueries({ queryKey: FEEDBACK_SETTINGS_KEY });
      } else {
        setError(err instanceof ApiError ? err.message : "The feedback could not be sent. Try again.");
      }
    }
  });

  const tooShort = message.trim().length < MIN_LENGTH;

  return createPortal(
    <Dialog
      open={open}
      onClose={close}
      title="Send feedback"
      description="Tell the implementation team what is wrong or what could be better. We review every message."
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (tooShort) {
            setError("Write at least a few words.");
            return;
          }
          setError(null);
          send.mutate();
        }}
        className="grid gap-5"
      >
        <fieldset className="grid gap-2">
          <legend className="mb-1.5 text-[13.5px] font-bold">What is it about?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(FEEDBACK_TYPES) as FeedbackType[]).map((key) => (
              <label
                key={key}
                className={cn(
                  "cursor-pointer rounded-btn border-[1.5px] px-3.5 py-3 transition-colors duration-150 has-focus-visible:shadow-[0_0_0_4px_var(--b50)]",
                  type === key ? "border-brand-500 bg-brand-25" : "border-line-2 hover:border-n-300"
                )}
              >
                <input
                  type="radio"
                  name="feedback-type"
                  value={key}
                  checked={type === key}
                  onChange={() => setType(key)}
                  className="sr-only"
                />
                <span className="block text-sm font-bold">{FEEDBACK_TYPES[key].label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{FEEDBACK_TYPES[key].hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Message" hint="What happened, where, and what you expected. The page you are on is sent with it.">
          {(props) => (
            <Textarea
              {...props}
              value={message}
              maxLength={4000}
              placeholder="E.g. When I save a booking the time goes back to 9:00"
              onChange={(event) => setMessage(event.target.value)}
            />
          )}
        </Field>
        {error ? (
          <p className="text-sm font-medium text-danger-500" role="alert">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" onClick={close} disabled={send.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={send.isPending}>
            <Send /> {send.isPending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>,
    document.body
  );
}
