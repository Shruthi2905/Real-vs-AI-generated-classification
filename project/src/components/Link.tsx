import { ReactNode } from 'react';

interface LinkProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function Link({ href, children, icon }: LinkProps) {
  return (
    <a
      href={href}
      className="text-pink-light hover:text-pink transition-colors flex items-center gap-2 px-3 py-2"
    >
      {icon}
      {children}
    </a>
  );
}