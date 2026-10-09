import { version } from '../../package.json';
import { footer, hero, profile } from '../data/profile.js';
import { useClock } from '../hooks/useClock.js';
import { useTheme } from '../hooks/useTheme.js';

function BranchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="5" r="2.2" />
      <circle cx="6" cy="19" r="2.2" />
      <circle cx="18" cy="7" r="2.2" />
      <path d="M6 7.2v9.6M18 9.2c0 4.6-6 4.2-11 7" />
    </svg>
  );
}

const item = 'flex items-center gap-1.5 px-3 py-1.5';

// The copyright line, then a full-width editor status bar: branch, version (package.json),
// local time in Botolan, the current theme and where it ships from.
// Back to top lives in the floating button (BackToTop.jsx), which lifts above this footer.
export default function Footer() {
  const year = new Date().getFullYear();
  const clock = useClock(hero.timeZone);
  const { theme } = useTheme();

  return (
    <footer className="border-t border-line">
      <div className="container-page py-5 text-sm text-muted">
        {/* The pre-rendered year can lag the client's after New Year until the next build. */}
        <p suppressHydrationWarning className="text-center sm:text-left">
          &copy; {year} {profile.name}. {footer.rights}
        </p>
      </div>
      <div className="border-t border-line bg-surface-2 font-mono text-[0.7rem] text-muted">
        <ul aria-label={footer.statusLabel} className="mx-auto flex max-w-[84rem] flex-wrap items-stretch">
          <li className={`${item} bg-accent text-accent-fg`}>
            <BranchIcon />
            <span className="sr-only">{footer.branchLabel}: </span>
            {footer.branch}
          </li>
          <li className={item}>
            <span className="sr-only">{footer.versionLabel}: </span>v{version}
          </li>
          <li className={item}>
            <span className="sr-only">{footer.timeLabel}: </span>
            <time suppressHydrationWarning className="tabular-nums text-fg">
              {clock ?? '--:--:--'}
            </time>
            <span>UTC+8</span>
          </li>
          <li className={item}>
            <span>{footer.themeLabel.toLowerCase()}:</span>
            <span suppressHydrationWarning className="text-fg">
              {theme}
            </span>
          </li>
          <li className={`${item} sm:ml-auto`}>{footer.deployed}</li>
          <li className={`${item} hidden sm:flex`}>{footer.encoding}</li>
        </ul>
      </div>
    </footer>
  );
}
