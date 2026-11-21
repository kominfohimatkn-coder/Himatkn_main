"use client";

import {
  cloneElement,
  useId,
  type AriaAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

type FormFieldControlProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
};

export type FormFieldProps = {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<FormFieldControlProps>;
};

export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const childProps = children.props;
  const controlId = childProps.id ?? id ?? generatedId;

  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  const describedBy =
    [childProps["aria-describedby"], hintId, errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = cloneElement(children, {
    id: controlId,
    required: required || childProps.required,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : childProps["aria-invalid"],
  });

  return (
    <div
      className={["grid gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <label
        htmlFor={controlId}
        className="block text-[11px] font-semibold tracking-[0.08em] text-green-900 uppercase"
      >
        {label}

        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (wajib)</span>
          </>
        ) : null}
      </label>

      {control}

      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs leading-5 text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}