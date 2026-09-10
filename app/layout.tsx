import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "ResumeForge — the AI resume builder",
  description:
    "Drop in a few keywords or upload what you have. Get a finished, ATS-ready resume in seconds — then tune it to perfection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
