import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="glass modal">
        <h1>Object not found</h1>
        <p>This static workspace lives at the home screen.</p>
        <Link className="btn primary" href="/">Return to OS-GOD</Link>
      </div>
    </main>
  );
}
