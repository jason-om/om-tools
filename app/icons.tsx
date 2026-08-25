/** Inline tool marks. Each is a 64×64 viewBox drawn with `currentColor` strokes
 *  so a card can tint the whole glyph with one CSS colour. */

type IconProps = { size?: number };

function Frame({ size = 48, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Convert & Compress — a document with conversion arrows and compression bars. */
export function ConvertCompressIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M16 30V10h18l12 12v8" />
      <path d="M34 10v12h12" />
      <path d="M14 40h14m-4-5-5 5 5 5" />
      <path d="M50 52H36m4-5 5 5-5 5" />
    </Frame>
  );
}

/** Dental Website Tracker — a tooth with a trend line reading across it. */
export function DentalTrackerIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M32 12c-6-4-14-3-16 4-2 6 1 12 2 18 1 5 1 12 4 12s3-8 6-8" />
      <path d="M32 12c6-4 14-3 16 4 2 6-1 12-2 18-1 5-1 12-4 12s-3-8-6-8" />
      <path d="M22 38h6l4-8 4 12 4-6h4" />
    </Frame>
  );
}

/** Deploys — a rocket lifting off a launch arc. */
export function DeploysIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M32 10c7 7 10 15 10 23l-10 8-10-8c0-8 3-16 10-23Z" />
      <circle cx="32" cy="26" r="4" />
      <path d="M22 36l-6 8 8-2M42 36l6 8-8-2" />
      <path d="M28 48c2 4 2 7 4 10 2-3 2-6 4-10" />
    </Frame>
  );
}

/** OM Tools / Command Center — a shield around a console prompt. */
export function CommandCenterIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M32 8l18 7v16c0 11-7 20-18 25-11-5-18-14-18-25V15l18-7Z" />
      <path d="M25 27l5 5-5 5" />
      <path d="M35 37h6" />
    </Frame>
  );
}
