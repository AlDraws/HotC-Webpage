import type { Metadata } from "next";
import { Bangers, Bowlby_One, Permanent_Marker } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../../fonts/Inter-VariableFont_opsz_wght.woff2",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../../fonts/Inter-Italic-VariableFont_opsz_wght.woff2",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
  display: "swap",
});

const bowlbyOne = Bowlby_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bowlby-one",
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bangers.variable} ${bowlbyOne.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="hotc flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
