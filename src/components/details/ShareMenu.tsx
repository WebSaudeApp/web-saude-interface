import { useEffect, useId, useRef, useState } from "react";
import { alertService } from "@/services/AlertService";

type ShareMenuProps = {
  name: string;
};

// `newTab` is false for mailto:, which would only leave an empty tab behind.
type ShareTarget = { label: string; href: string; newTab: boolean };

function shareTargets(url: string, text: string): ShareTarget[] {
  const message = `${text} ${url}`;
  return [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
      newTab: true,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      newTab: true,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      newTab: true,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      newTab: true,
    },
    {
      label: "E-mail",
      href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(message)}`,
      newTab: false,
    },
  ];
}

// The link of this page without hash or query, so nothing personal travels
// with it.
function pageUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

/**
 * Share button. On phones it opens the system share sheet, which lists the
 * visitor's own apps (WhatsApp, Instagram, ...). Where there is none, a small
 * popover offers the main networks and "Copiar link". Instagram has no web share
 * address, so there it is reached through the system sheet or the copied link.
 */
export default function ShareMenu({ name }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popoverId = useId();
  const text = `${name} — Web Saúde`;

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleClick() {
    if (open) {
      setOpen(false);
      return;
    }
    const link = pageUrl();
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: text, text, url: link });
        return;
      } catch (error) {
        // Closing the sheet is a choice, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
    setUrl(link);
    setOpen(true);
  }

  async function copyLink() {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(url);
      alertService.success("Link copiado.");
    } catch {
      alertService.info("Copie o link na barra de endereços.");
    }
  }

  return (
    <div className="share" ref={rootRef}>
      <button
        className="icon-btn"
        type="button"
        onClick={handleClick}
        aria-label="Compartilhar"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        title="Compartilhar"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
        </svg>
      </button>
      {open && (
        <div className="share-menu" id={popoverId}>
          {shareTargets(url, text).map((target) => (
            <a
              key={target.label}
              href={target.href}
              {...(target.newTab
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={() => setOpen(false)}
            >
              {target.label}
            </a>
          ))}
          <button type="button" onClick={copyLink}>
            Copiar link
          </button>
        </div>
      )}
    </div>
  );
}
