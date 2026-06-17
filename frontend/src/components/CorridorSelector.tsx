'use client';

import { useState, useEffect, useCallback } from 'react';

interface CorridorPath {
  source_asset_code: string;
  destination_amount: string;
  path: { asset_code: string }[];
}

interface Corridor {
  corridor: string;
  destAsset: string;
  bestRate: string | null;
  paths: CorridorPath[];
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function CorridorSelector() {
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [amount, setAmount] = useState('10');
  const [selected, setSelected] = useState<Corridor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCorridors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/corridors?amount=${amount}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Corridor[] = await res.json();
      setCorridors(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [amount]);

  useEffect(() => { fetchCorridors(); }, [fetchCorridors]);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">LuminaPay — Corridor Rates</h1>

      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium">Send amount (USDC)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded px-2 py-1 w-24 text-sm"
        />
        <button
          onClick={fetchCorridors}
          disabled={loading}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <ul className="space-y-2">
        {corridors.map((c) => (
          <li
            key={c.corridor}
            onClick={() => setSelected(c)}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selected?.corridor === c.corridor
                ? 'border-indigo-600 bg-indigo-50'
                : 'hover:border-gray-400'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{c.corridor}</span>
              {c.error ? (
                <span className="text-red-400 text-xs">Unavailable</span>
              ) : (
                <span className="text-green-700 font-mono text-sm">
                  {c.bestRate ? `${parseFloat(c.bestRate).toLocaleString()} ${c.destAsset}` : '—'}
                </span>
              )}
            </div>
            {c.paths?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                via {c.paths[0].path.map((p) => p.asset_code).join(' → ') || 'direct'}
              </p>
            )}
          </li>
        ))}
      </ul>

      {selected && !selected.error && (
        <div className="border-t pt-4 space-y-2">
          <h2 className="font-semibold">Selected: {selected.corridor}</h2>
          <p className="text-sm text-gray-600">
            Sending <strong>{amount} USDC</strong> → receive ~
            <strong> {selected.bestRate ? parseFloat(selected.bestRate).toLocaleString() : '—'} {selected.destAsset}</strong>
          </p>
          <p className="text-xs text-gray-400">Rate includes 0.5% slippage tolerance. Zero platform fee.</p>
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700"
            onClick={() => alert(`Initiating remittance on ${selected.corridor} corridor…`)}
          >
            Send via {selected.corridor}
          </button>
        </div>
      )}
    </div>
  );
}
