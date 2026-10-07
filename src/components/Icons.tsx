export function Logo({ size = 26 }: { size?: number }) {
  // Thin gold double-line "D" monogram.
  return (
    <svg width={size * 0.86} height={size} viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <path d="M2.5 1.5h7.2c6.2 0 10.3 4.6 10.3 11.5S15.9 24.5 9.7 24.5H2.5" stroke="#B8975A" strokeWidth="1.4" />
      <path d="M6 1.5v23M6 5h3.6c4 0 6.7 3.1 6.7 8s-2.7 8-6.7 8H6" stroke="#B8975A" strokeWidth="1.4" />
    </svg>
  );
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className="arrow">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="chev">
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsApp({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1FA855" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.3 4.1c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5 0 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4l-.4-.3-2-1c-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6z" />
    </svg>
  );
}

export function Coins() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" stroke="#B8975A" strokeWidth="1.5" aria-hidden="true">
      <ellipse cx="27" cy="6" rx="9" ry="3.5" />
      <path d="M18 6v20c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V6" />
      <path d="M18 11c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5M18 16c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5M18 21c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5" />
      <ellipse cx="11" cy="19" rx="9" ry="3.5" fill="#FBF9F6" />
      <path d="M2 19v10c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V19" fill="#FBF9F6" />
      <path d="M2 24c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5" />
    </svg>
  );
}

export function Pin() {
  return (
    <svg width="30" height="38" viewBox="0 0 30 38" fill="none" stroke="#B8975A" strokeWidth="1.5" aria-hidden="true">
      <path d="M15 36s12-12.4 12-21.5C27 7.6 21.6 2 15 2S3 7.6 3 14.5C3 23.6 15 36 15 36z" />
      <circle cx="15" cy="14" r="4.5" />
    </svg>
  );
}

export function Chat() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" stroke="#B8975A" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 2C10 2 2 8.7 2 17c0 3.9 1.8 7.4 4.7 10.1L5 34l7.6-3.6c2.3.8 4.8 1.2 7.4 1.2 10 0 18-6.7 18-15S30 2 20 2z" />
      <circle cx="13" cy="17" r="1.4" fill="#B8975A" /><circle cx="20" cy="17" r="1.4" fill="#B8975A" /><circle cx="27" cy="17" r="1.4" fill="#B8975A" />
    </svg>
  );
}

export function UaeFlag() {
  return (
    <svg width="20" height="13" viewBox="0 0 20 13" aria-hidden="true" className="flag">
      <rect width="20" height="13" fill="#fff" />
      <rect width="20" height="4.33" fill="#00732F" />
      <rect y="8.67" width="20" height="4.33" fill="#000" />
      <rect width="5.5" height="13" fill="#EF3340" />
    </svg>
  );
}
