export default function SplashScreen() {
  return (
    <main
      data-testid="splash-screen"
      className="grid min-h-screen place-items-center px-6 text-center"
      aria-label="Habit Tracker loading"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Daily progress</p>
        <h1 className="mt-3 text-4xl font-bold text-slate-950">Habit Tracker</h1>
      </div>
    </main>
  );
}
