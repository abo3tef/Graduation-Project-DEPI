import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";

export const instant = false;

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-layout">
      <NavBar />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}
