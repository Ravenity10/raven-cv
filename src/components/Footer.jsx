import { footer, profile } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-10">
      <div className="container-page flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        {/* The pre-rendered year can lag the client's after New Year until the next build. */}
        <p suppressHydrationWarning>
          &copy; {year} {profile.name}. {footer.note}
        </p>
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            scrollToTarget('top');
            document.querySelector('#site-header a')?.focus({ preventScroll: true });
          }}
          className="font-medium text-fg hover:text-accent"
        >
          {footer.backToTop}
        </a>
      </div>
    </footer>
  );
}
