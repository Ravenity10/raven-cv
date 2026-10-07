import { footer, profile } from '../data/profile.js';
import { scrollToTarget } from '../hooks/useSmoothScroll.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-8">
      <div className="container-page flex flex-col-reverse items-center gap-5 text-sm text-muted sm:flex-row sm:justify-between">
        {/* The pre-rendered year can lag the client's after New Year until the next build. */}
        <p suppressHydrationWarning className="text-center sm:text-left">
          &copy; {year} {profile.name}. {footer.rights}
        </p>
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            scrollToTarget('top');
            document.querySelector('#site-header a')?.focus({ preventScroll: true });
          }}
          className="group glass inline-flex items-center gap-3 rounded-full border border-line py-1.5 pl-5 pr-1.5 font-medium text-fg transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-(--grad-2)/20"
        >
          {footer.backToTop}
          <span aria-hidden="true" className="grid size-8 place-items-center overflow-hidden rounded-full bg-brand-strong text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-y-0.5">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </span>
        </a>
      </div>
    </footer>
  );
}
