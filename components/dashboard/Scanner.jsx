'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { scanReservation, forceCheckIn } from '@/lib/actions';

const READER_ID = 'qr-reader';

export default function Scanner() {
  const scannerRef = useRef(null);
  const busyRef = useRef(false);
  const [status, setStatus] = useState('loading'); // loading | scanning | error | result
  const [result, setResult] = useState(null);

  const handleDecoded = useCallback(async (decodedText) => {
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      await scannerRef.current?.pause(true);
    } catch {
      // le scanner peut déjà être en pause, sans conséquence
    }

    try {
      const res = await scanReservation(decodedText);
      setResult(res);
      setStatus('result');
    } catch {
      setResult({ result: 'ERROR' });
      setStatus('result');
    } finally {
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    let html5Qrcode;
    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      html5Qrcode = new Html5Qrcode(READER_ID);
      scannerRef.current = html5Qrcode;

      html5Qrcode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleDecoded(decodedText),
          () => {} // erreurs de décodage image par image : on les ignore
        )
        .then(() => setStatus('scanning'))
        .catch(() => setStatus('error'));
    });

    return () => {
      cancelled = true;
      if (html5Qrcode) {
        html5Qrcode
          .stop()
          .catch(() => {})
          .finally(() => html5Qrcode.clear());
      }
    };
  }, [handleDecoded]);

  async function resumeScanning() {
    setResult(null);
    setStatus('scanning');
    try {
      await scannerRef.current?.resume();
    } catch {
      // si la reprise échoue, l'utilisateur peut recharger la page
    }
  }

  async function handleForceCheckIn(id) {
    await forceCheckIn(id);
    resumeScanning();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id={READER_ID}
        className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-brand-600 bg-black shadow-lg"
      />

      {status === 'loading' && (
        <p className="text-sm text-stone-500">Initialisation de la caméra…</p>
      )}

      {status === 'error' && (
        <p className="max-w-sm text-center text-sm text-red-600">
          Impossible d'accéder à la caméra. Vérifiez que le navigateur y est autorisé, et que la
          page est bien ouverte en HTTPS.
        </p>
      )}

      {status === 'result' && result && (
        <ScanResultCard result={result} onNext={resumeScanning} onForce={handleForceCheckIn} />
      )}
    </div>
  );
}

function ScanResultCard({ result, onNext, onForce }) {
  const r = result.reservation;

  if (result.result === 'OK' || result.result === 'ALREADY_CHECKED_IN') {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-emerald-600 p-6 text-center text-white shadow-xl">
        <p className="text-6xl font-extrabold tracking-tight">OK</p>
        <p className="mt-3 text-lg font-semibold">Chambre {r?.room_number}</p>
        <p className="text-emerald-100">
          {r?.guest_count} pers. · {r?.time_slot}
        </p>
        {result.result === 'ALREADY_CHECKED_IN' && (
          <p className="mt-2 text-xs text-emerald-100">⚠️ Ce client a déjà été scanné.</p>
        )}
        {r?.special_request && (
          <p className="mt-3 rounded-lg bg-emerald-700/60 px-3 py-2 text-sm">
            🍽️ {r.special_request}
          </p>
        )}
        <button
          onClick={onNext}
          className="mt-5 rounded-full bg-white px-6 py-2 font-semibold text-emerald-700"
        >
          Scanner suivant
        </button>
      </div>
    );
  }

  if (result.result === 'WRONG_SLOT') {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-red-600 p-6 text-center text-white shadow-xl">
        <p className="text-6xl font-extrabold tracking-tight">STOP</p>
        <p className="mt-3 text-lg font-semibold">Chambre {r?.room_number}</p>
        <p className="text-red-100">Réservation prévue pour {r?.time_slot}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onNext}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-red-700"
          >
            Scanner suivant
          </button>
          <button
            onClick={() => onForce(r.id)}
            className="rounded-full bg-red-800 px-5 py-2 text-sm font-semibold text-white"
          >
            Faire entrer quand même
          </button>
        </div>
      </div>
    );
  }

  const messages = {
    NOT_FOUND: 'Réservation introuvable — QR code invalide.',
    CANCELLED: 'Cette réservation a été annulée.',
    WRONG_DAY: "Cette réservation n'est pas prévue pour aujourd'hui.",
    ERROR: 'Une erreur est survenue pendant la vérification.',
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-stone-700 p-6 text-center text-white shadow-xl">
      <p className="text-4xl">⚠️</p>
      <p className="mt-3">{messages[result.result] || 'Erreur inconnue.'}</p>
      <button
        onClick={onNext}
        className="mt-5 rounded-full bg-white px-6 py-2 font-semibold text-stone-700"
      >
        Réessayer
      </button>
    </div>
  );
}
