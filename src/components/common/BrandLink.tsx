import Link from "next/link";
import { publicRoutes } from "@/configs/Routes";

export default function BrandLink() {
  return (
    <Link className="brand" href={publicRoutes.home}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M8 12h8M12 8v8" strokeLinecap="round" />
          <circle cx="15.2" cy="15.2" r="1.1" fill="#fff" stroke="none" />
          <circle cx="18.4" cy="13.2" r="1.1" fill="#fff" stroke="none" />
          <circle cx="16.8" cy="18.2" r="1.1" fill="#fff" stroke="none" />
          <path d="M15.2 15.2l3.2-2M15.2 15.2l1.6 3" />
        </svg>
      </span>
      <span>Web Saúde</span>
    </Link>
  );
}
