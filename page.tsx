"use client";

import { useState, type FormEvent } from "react";
import QRScannerView from "@/components/QRScannerView";
import { checkInReservation, findTodaysReservationsByRoom } from "@/lib/reservations";
import { slotLabel } from "@/lib/slots";
import type { CheckInResult, Reservation } from "@/lib/types";

// Le QR contient une URL (.../confirmation/<uuid>) ou, en repli, l'uuid brut.
function extractReservationId(raw: string): string {
  const match = raw.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : raw.trim();
}

export default function ScannerPage() {
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [roomQuery, setRoomQuery] = useState("");
  const [candidates, setCandidates] = useState<Reservation[] | null>(null);

  async function runCheckIn(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await checkInReservation(id);
      setResult(res);
      setCandidates(null);
    } catch {
      setError("QR code non reconnu. Réessayez ou utilisez la recherche par chambre.");
    } finally {
      setBusy(false);
    }
  }

  function handleDecode(raw: string) {
    if (result || busy) return; // un résultat est déjà affiché, on ignore
    runCheckIn(extractReservationId(raw));
  }

  async function handleRoomSearch(e: FormEvent) {
    e.preventDefault();
    if (!roomQuery.trim()) return;
    setBusy(true);
    setError(null);
    setCandidates(null);
    try {
      const matches = await findTodaysReservationsByRoom(roomQuery.trim());
      if (matches.length === 0) {
        setError("Aucune réservation aujourd'hui pour cette chambre.");
      } else if (matches.length === 1) {
        await runCheckIn(matches[0].id);
      } else {
        setCandidates(matches);
      }
    } catch {
      setError("Recherche impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setCandidates(null);
    setRoomQuery("");
  }

  if (result) {
    const ok = result.is_on_time;
    return (
      <div
        role="alert"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 text-center ${
          ok ? "bg-success" : "bg-danger"
        }`}
      >
        <p className="font-display text-8xl font-bold text-white">
          {ok ? "OK" : "STOP"}
        </p>
        <div className="text-white">
          <p className="text-2xl font-medium">
            Chambre {result.reservation.room_number}
          </p>
          <p className="mt-1 text-lg opacity-90">
            {result.reservation.guest_count} pers. ·{" "}
            {slotLabel(result.reservation.time_slot_id)}
          </p>
          {!ok && (
            <p className="mt-3 max-w-xs text-sm opacity-90">
              Ce client ne se présente pas sur son créneau réservé.
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-white px-8 py-3 font-display text-lg font-medium text-charcoal shadow-lg"
        >
          Scanner suivant
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <div>
        <h1 className="font-display text-2xl font-medium text-charcoal">
          Scanner d&rsquo;entrée
        </h1>
        <p className="text-sm text-charcoal-soft">
          Scannez le QR code présenté par le client.
        </p>
      </div>

      <QRScannerView onDecode={handleDecode} />

      {busy && (
        <p className="text-center text-sm text-charcoal-soft">Vérification…</p>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <details className="rounded-xl bg-white px-4 py-3 shadow-sm">
        <summary className="cursor-pointer text-sm font-medium text-charcoal">
          La caméra ne fonctionne pas ? Rechercher par chambre
        </summary>
        <form onSubmit={handleRoomSearch} className="mt-3 flex gap-2">
          <input
            value={roomQuery}
            onChange={(e) => setRoomQuery(e.target.value)}
            placeholder="N° de chambre"
            inputMode="numeric"
            className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-burgundy"
          />
          <button
            type="submit"
            className="rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-cream"
          >
            Chercher
          </button>
        </form>

        {candidates && candidates.length > 1 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-charcoal-soft">
              Plusieurs réservations pour cette chambre aujourd&rsquo;hui —
              choisissez le bon créneau :
            </p>
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => runCheckIn(c.id)}
                className="block w-full rounded-lg border border-black/10 px-3 py-2 text-left text-sm hover:bg-cream-dim"
              >
                {slotLabel(c.time_slot_id)} · {c.guest_count} pers.
              </button>
            ))}
          </div>
        )}
      </details>
    </div>
  );
}
