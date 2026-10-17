import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const serif = Playfair_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Margins — Personal Morning Paper",
  description: "An AI-powered personalized daily newspaper built around what you read. Delivered every morning in print-ready and web editions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
