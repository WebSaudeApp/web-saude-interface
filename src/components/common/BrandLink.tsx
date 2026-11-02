import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";

// Magnifying glass with a cross in the lens. Drawn with currentColor, so it
// is white on the teal header and teal on light pages (set in the CSS).
function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 48 48" aria-hidden="true">
      <circle
        cx="19.5"
        cy="19.5"
        r="16"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M19.5 12v15M12 19.5h15"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M31.5 31.5L42.5 42.5"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BrandLink() {
  return (
    <Link className="brand" href={publicRoutes.home}>
      <BrandMark />
      <span className="brand-name">
        Web <b>Saúde</b>
      </span>
    </Link>
  );
}
