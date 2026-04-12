import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />

      <section
        id="games"
        className="mx-auto max-w-7xl px-6 py-20 text-slate-300 md:px-8"
      >
        Games section coming next
      </section>

      <section
        id="upload"
        className="mx-auto max-w-7xl px-6 py-20 text-slate-300 md:px-8"
      >
        Upload section coming next
      </section>
    </div>
  );
}