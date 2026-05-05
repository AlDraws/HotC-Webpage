import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="w-full py-12 px-6 flex flex-col items-center justify-center gap-6 bg-hotc-black text-hotc-cream border-t-4 border-hotc-black">
      <div className="text-center">
        <p className="font-comic-neue text-sm opacity-80 mb-2">Developed and designed by</p>
        <Link
          href="https://www.alvaro-serrano.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:opacity-80 transition-opacity"
        >
          <Image
            src="/assets/logo-alvaro.png"
            alt="Alvaro Serrano"
            width={200}
            height={50}
            className="h-auto w-40 object-contain"
          />
        </Link>
      </div>
    </footer>
  );
}
