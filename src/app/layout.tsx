import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const unbounded = Unbounded({
    variable: "--font-unbounded",
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Car Repair Shop - Drive With Confidence",
    description:
        "Professional car repair services with trusted expertise. Best car repair shop with skilled technicians and guaranteed satisfaction.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.variable} ${unbounded.variable} antialiased`}>
        {children}
        </body>
        </html>
    );
}
