import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";

export default function BrandLink() {
  return (
    <Link className="brand" href={publicRoutes.home}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M6 12h12M12 6v12" strokeLinecap="round" />
        </svg>
      </span>
      <span>Web Saúde</span>
    </Link>
  );
}
