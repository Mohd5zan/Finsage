
interface NavbarProps {
  onLogout: () => void;
}

function Navbar({ onLogout }: NavbarProps) {
  return (
    <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          FinSage
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your AI expense copilot
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Dashboard
          </button>

          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
          >
            Expenses
          </button>

          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
          >
            AI Assistant
          </button>
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;
