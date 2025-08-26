import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-yellow-500/10">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Mystic. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="mystic-link">
            Privacy
          </Link>
          <Link href="/terms" className="mystic-link">
            Terms
          </Link>
          <Link href="/contact" className="mystic-link">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
