import Navbar from "./components/Navbar"
export default function App() {
	return (
		<div className="min-h-screen bg-slate-900">
			<Navbar />
			<main className="mx-auto max-w-7xl px-6 py-8 md:px-8">
				<h1 className="text-3xl font-bold text-white">Welcome to the Game Showcase</h1>
				<p className="text-slate-400">
					Discover the latest games created by HCMUT students.
				</p>
			</main>
		</div>
	)
}