import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/src/app/lib/utils";
import "./globals.css";
import { AI } from "./actions";
import { ThemeProvider } from "@/components/theme_provider";

const inter = Inter({ subsets: ["latin"] });

let title = "Rach Pradhan's portfolio website";
let description =
  'Rach Pradhan | Builder ';
  let ogimage = 'https://portfolio.rachit.ai/rach_opengrpah.webp';
  let url = 'https://rachpradhan.com';
let sitename = 'Rach Pradhan';
// lamo this is stupid
export const metadata: Metadata = {
  keywords: [
    'Rach Pradhan',
    'Rach Pradhan portfolio',
    'Who is Rach Pradhan',
    'Rach Pradhan AI',
    'rachitai',
    'condensation.ai'


  ],
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AI>
      <html lang="en" className="h-full">
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <body className={cn(inter.className, "h-full")}>{children}</body>
        </ThemeProvider>
      </html>
    </AI>
  );
}
