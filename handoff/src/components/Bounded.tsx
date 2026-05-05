import { CSSProperties, ElementType, ReactNode } from "react";

type BoundedProps = {
  as?: ElementType;
  yPadding?: "sm" | "base" | "lg" | "none";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const yPad = {
  none: "",
  sm: "py-8 md:py-10",
  base: "py-16 md:py-20",
  lg: "py-32 md:py-48",
};

/**
 * Centered, max-width container. Use for any inner content
 * that should respect the site's gutters.
 *
 * Fix #2 (Recent Appearances): we use `mx-auto` + symmetrical
 * padding here, so any child stays centered at every zoom level.
 */
export default function Bounded({
  as: Comp = "div",
  yPadding = "base",
  className = "",
  style,
  children,
}: BoundedProps) {
  return (
    <Comp
      className={`w-full ${yPad[yPadding]} ${className}`}
      style={style}
    >
      <div className="mx-auto w-full max-w-6xl px-6">{children}</div>
    </Comp>
  );
}
