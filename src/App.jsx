import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GamesSection from "./components/GamesSection";
import UploadSection from "./components/UploadSection";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
	  <GamesSection />
      <UploadSection />
    </div>
  );
}