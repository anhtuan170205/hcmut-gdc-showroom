import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GamesSection from "./components/GamesSection";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
	  <GamesSection />
      <section
        id="upload"
        className="mx-auto max-w-7xl px-6 py-20 text-slate-300 md:px-8"
      >
        Upload section coming next
      </section>
    </div>
  );
}