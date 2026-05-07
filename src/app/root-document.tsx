import { Bangers, Bowlby_One, Permanent_Marker } from "next/font/google";

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "optional",
  preload: false,
});

const bowlbyOne = Bowlby_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bowlby-one",
  display: "optional",
  preload: false,
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "optional",
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
      className={`${bangers.variable} ${bowlbyOne.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://images.prismic.io" />
      </head>
      <body className="hotc flex min-h-full flex-col">{children}</body>
    </html>
  );
}
