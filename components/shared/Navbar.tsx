import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav 
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6"
      style={{ 
        height: '56px', 
        backgroundColor: 'var(--surface)', 
        borderBottom: '1px solid var(--border)' 
      }}
    >
      <div className="flex items-center">
        <Link href="/" className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
          LadeDesign
        </Link>
      </div>
      <div className="flex items-center">
        <Link href="/canvas">
          <Button style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
            Open Canvas &rarr;
          </Button>
        </Link>
      </div>
    </nav>
  );
}
