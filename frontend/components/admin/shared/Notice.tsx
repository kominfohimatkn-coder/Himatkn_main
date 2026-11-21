import type { ReactNode } from "react";

const tones = {
  default: "border-line bg-mint-50 text-green-900 [&_svg]:text-green-700",
  amber: "border-[#ebd9b4] bg-amber-bg text-[#5c4410] [&_svg]:text-amber",
};

/** Kotak pemberitahuan, mengikuti `.notice` di Design/admin. */
export function Notice({
  icon,
  tone = "default",
  className = "",
  children,
}: {
  icon: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[4px] border px-3.5 py-3 text-[13px] [&_svg]:mt-px [&_svg]:size-[17px] [&_svg]:shrink-0 ${tones[tone]} ${className}`.trim()}
    >
      {icon}
      <div>{children}</div>
    </div>
  );
}