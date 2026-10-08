import { footer, profile } from '../data/profile.js';

// Back to top lives in the floating button (BackToTop.jsx), which lifts above this footer.
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-8">
      <div className="container-page text-sm text-muted">
        {/* The pre-rendered year can lag the client's after New Year until the next build. */}
        <p suppressHydrationWarning className="text-center sm:text-left">
          &copy; {year} {profile.name}. {footer.rights}
        </p>
      </div>
    </footer>
  );
}
