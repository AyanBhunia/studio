import type { SVGProps } from "react";

export const ClubIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C9.243 2 7 4.243 7 7c0 1.5.666 2.834 1.707 3.707A5.002 5.002 0 007 15.5C7 18.538 9.462 21 12.5 21s5.5-2.462 5.5-5.5a5.002 5.002 0 00-1.707-3.793A4.975 4.975 0 0017 7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z" />
  </svg>
);

export const DiamondIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </svg>
);

export const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const SpadeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C8.686 2 6 4.686 6 8c0 2.454 1.413 4.537 3.425 5.575C7.03 14.938 5 17.72 5 21h14c0-3.28-2.03-6.062-4.425-7.425C16.587 12.537 18 10.454 18 8c0-3.314-2.686-6-6-6z" />
  </svg>
);
