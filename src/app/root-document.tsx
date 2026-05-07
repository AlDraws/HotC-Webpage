import { Bangers, Bowlby_One, Permanent_Marker } from "next/font/google";
import localFont from "next/font/local";

const inter = localFont({
  src: [
    {
      path: "../../fonts/Inter-Latin-Variable.woff2",
      style: "normal",
      weight: "100 900",
    },
  ],
  variable: "--font-inter",
  display: "optional",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
  preload: false,
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

export function RootDocument({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  return (
    <html
      lang={lang}
      className={`${inter.variable} ${bangers.variable} ${bowlbyOne.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.prismic.io" />
      </head>
      <body className="hotc flex min-h-full flex-col">{children}</body>
    </html>
  );
}
