import { useEffect, useState } from "react";

type Person = {
  _id: string;
  userId: string;
  name: string;
  email: string;
};

export default function PeopleList() {
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/person")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: Person[]) => {
        if (isMounted) setPeople(data);
      })
      .catch((err: Error) => {
        if (isMounted) setError(err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-300">Error: {error}</p>;
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
      <h2 className="text-xl font-semibold text-white">People</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {people.map((person) => (
          <li key={person._id} className="rounded-xl bg-slate-950/60 px-4 py-2">
            <div className="font-medium text-slate-100">{person.name}</div>
            <div className="text-xs text-slate-400">{person.email}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
