import Navbar from "@/components/Navbar";
import FamePanel from "@/components/FamePanel";

export const metadata = {
  title: "FAME — OSROX",
};

export default function FamePage() {
  return (
    <div className="h-full flex flex-col bg-bg-dark bg-grid">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <FamePanel />
      </main>
    </div>
  );
}
