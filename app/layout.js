import "./globals.css";

export const metadata = {
  title: "Routely — Smart Link Router & Blog",
  description:
    "One link, every platform. Route visitors to the right App Store, Play Store, or web page automatically — with real-time analytics and a built-in blog.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-paper text-ink-900 antialiased">{children}</body>
    </html>
  );
}
