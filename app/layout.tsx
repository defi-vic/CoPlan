import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoPlan — shared itinerary",
  description: "A shared live itinerary for people and browser agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
