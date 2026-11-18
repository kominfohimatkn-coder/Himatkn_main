"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Checkbox({
  label,
  description,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description
    ? `${controlId}-description`
    : undefined;

  const describedBy =
    [props["aria-describedby"], descriptionId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <label
      htmlFor={controlId}
      className={[
        "flex cursor-pointer items-start gap-3 text-sm text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        {...props}
        id={controlId}
        type="checkbox"
        aria-describedby={describedBy}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <span className="min-w-0">
        <span className="block font-medium leading-6">{label}</span>

        {description ? (
          <span
            id={descriptionId}
            className="mt-0.5 block text-xs leading-5 text-ink-soft"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
