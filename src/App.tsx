import { useState } from 'react'
import PeopleList from './components/PeopleList'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14">
        <header className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-5">
            <a
              href="https://vite.dev"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-slate-600"
            >
              <img
                src={viteLogo}
                className="h-14 w-14 transition group-hover:rotate-6"
                alt="Vite logo"
              />
            </a>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-sky-400"
            >
              <img
                src={reactLogo}
                className="h-14 w-14 transition group-hover:-rotate-6"
                alt="React logo"
              />
            </a>
          </div>
          <span className="rounded-full border border-slate-800 bg-slate-900/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            starter kit
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Vite + React
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            A clean, fast build setup with a touch of polish. Click the logos to
            explore the docs and keep iterating with instant feedback.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Interaction</h2>
            <p className="mt-2 text-sm text-slate-400">
              Tap the button to see state updates in action.
            </p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={() => setCount((count) => count + 1)}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5"
              >
                Count is {count}
              </button>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                Live HMR enabled
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
            <h3 className="text-lg font-semibold text-white">Quick tip</h3>
            <p className="mt-3 text-sm text-slate-400">
              Edit{' '}
              <code className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-200">
                src/App.tsx
              </code>{' '}
              and save to test hot module replacement.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-slate-500">
              Click the Vite and React logos to learn more.
            </p>
          </div>
        </section>

        <PeopleList />
      </div>
    </main>
  )
}

export default App
