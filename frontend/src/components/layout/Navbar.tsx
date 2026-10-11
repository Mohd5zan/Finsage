function Navbar() {
  return (
    <header className="mb-10 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          FinSage
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your AI expense copilot
        </p>
      </div>

      <nav className="flex items-center gap-2">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Dashboard
        </button>

        <button
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
        >
          Expenses
        </button>

        <button
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
        >
          AI Assistant
        </button>
      </nav>
    </header>
  );
}

export default Navbar;