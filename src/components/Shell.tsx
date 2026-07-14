import { ReactNode } from "react";
import Header from "./Header";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import Toast from "./Toast";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">{children}</main>
      <Footer />
      <BottomNav />
      <Toast />
    </>
  );
}
