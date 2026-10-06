import { profile } from '../data/profile.js';

// Download link for the CV PDF, used in the header, hero, experience and contact sections.
export default function CvLink({ label = profile.cv.label, className, onClick }) {
  return (
    <a href={profile.cv.href} download={profile.cv.fileName} type="application/pdf" className={className} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </svg>
      {label}
      <span className="sr-only"> {profile.cv.format}</span>
    </a>
  );
}
