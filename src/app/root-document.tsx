import { Bangers, Bowlby_One, Permanent_Marker } from "next/font/google";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
  preload: true,
});

const bowlbyOne = Bowlby_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bowlby-one",
  display: "swap",
  preload: false,
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "swap",
  preload: false,
});

export function RootDocument({ children, lang }: { children: React.ReactNode; lang: string }) {
  return (
    <html
      lang={lang}
      dir="ltr"
      className={`${bangers.variable} ${bowlbyOne.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.prismic.io" />
      </head>
      <body className="hotc flex min-h-full flex-col">{children}</body>
    </html>
  );
}
