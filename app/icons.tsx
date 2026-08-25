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

/* ---- Interface icons ------------------------------------------------- */

function Ui({ size = 16, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Ui>
  );
}

export function GridViewIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <rect x="3" y="3" width="9" height="12" rx="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="12" width="6" height="9" rx="1.5" />
      <rect x="3" y="18" width="9" height="3" rx="1.5" />
    </Ui>
  );
}

export function CardsViewIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </Ui>
  );
}

export function ListViewIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </Ui>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Ui>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </Ui>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4a6.6 6.6 0 0 0 9.5 9.5Z" />
    </Ui>
  );
}

export function WrenchIcon(props: IconProps) {
  return (
    <Ui {...props}>
      <path d="M15.5 3a5.5 5.5 0 0 0-4.9 8L3 18.6 5.4 21l7.6-7.6a5.5 5.5 0 0 0 6.5-8.1l-3.1 3.1-2.8-2.8L16.7 3a5.6 5.6 0 0 0-1.2 0Z" />
    </Ui>
  );
}
