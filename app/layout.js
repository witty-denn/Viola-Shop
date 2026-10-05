import "./globals.css";
export const metadata = { title: "QuickShop", description: "HNG15 Lesson 2 shop" };
export default function RootLayout({children}) {
  return <html lang="en"><body>{children}</body></html>;
}