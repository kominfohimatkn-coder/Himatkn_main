import type { SVGProps } from "react";

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g stroke="currentColor" strokeWidth="1.8">
        <path d="M24 7l10.5 6.1v12.1L24 31.3l-10.5-6.1V13.1L24 7Z" />
        <path d="M24 31.3v9.7" />
        <path d="M13.5 25.2 6.7 29.1v7.2l6.8 3.9 6.8-3.9v-7.2l-6.8-3.9Z" />
        <path d="M34.5 25.2l6.8 3.9v7.2l-6.8 3.9-6.8-3.9v-7.2l6.8-3.9Z" />
        <circle cx="24" cy="19" r="4.2" />
      </g>
    </svg>
  );
}
