import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MyRuntimeProvider } from "@/src/app/MyRuntimeProvider";
import { cn } from "@/src/app/lib/utils";
import "./globals.css";
import { AI } from "./actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AI>
    {/* <MyRuntimeProvider> */}
      <html lang="en" className="h-full">
        <body className={cn(inter.className, "h-full")}>{children}</body>
      </html>
    {/* </MyRuntimeProvider> */}
    </AI>
  );
}
