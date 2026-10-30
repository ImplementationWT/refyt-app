import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-brand-600 text-on-brand shadow-brand hover:-translate-y-px hover:bg-brand-700",
  secondary: "border-[1.5px] border-line-2 bg-surface text-ink hover:border-n-300 hover:bg-n-25",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  ghost: "text-muted hover:bg-n-50 hover:text-ink",
  danger: "bg-danger-500 text-white hover:-translate-y-px hover:bg-danger-700"
} as const;

const SIZES = {
  sm: "h-[34px] gap-1.5 rounded-btn px-3 text-[13px]",
  md: "h-[38px] gap-2 rounded-btn px-[15px] text-sm",
  lg: "h-11 gap-2 rounded-btn px-[18px] text-[15px]"
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-soft",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  /** Red counter bubble (hidden when 0 or undefined). */
  badge?: number;
  size?: "md" | "sm";
}

/** Square icon button; md has a border (header tools), sm is borderless (row actions). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, badge, size = "md", type = "button", children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "relative grid shrink-0 place-items-center text-muted transition-colors duration-150",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "md"
          ? "size-[42px] rounded-btn border-[1.5px] border-line bg-surface hover:border-brand-200 hover:bg-brand-25 hover:text-brand-600 [&_svg]:size-[19px]"
          : "size-8 rounded-tile hover:bg-n-50 hover:text-ink [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {children}
      {badge ? (
        <span
          data-testid="unread-count"
          className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-danger-500 px-1.5 text-[11.5px] font-bold text-white ring-2 ring-surface"
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  )
);
IconButton.displayName = "IconButton";
