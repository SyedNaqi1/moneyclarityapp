import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Clarity — Finally understand where your business money is going",
  description: "A calm, lightweight money cockpit for small businesses."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
