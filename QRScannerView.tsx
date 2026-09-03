"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const CONTAINER_ID = "qr-reader";

export default function QRScannerView({
  onDecode,
}: {
  onDecode: (text: string) => void;
}) {
  // Un ref garde toujours la dernière version du callback sans jamais
  // redémarrer la caméra quand le parent se re-rend (ce qui arrive à
  // chaque scan) : le useEffect ci-dessous ne dépend que du montage.
  const onDecodeRef = useRef(onDecode);
  useEffect(() => {
    onDecodeRef.current = onDecode;
  });

  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(CONTAINER_ID);
    let cancelled = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => onDecodeRef.current(decodedText),
        () => {
          /* pas de QR détecté sur cette image : normal, on ignore */
        }
      )
      .catch(() => {
        if (!cancelled) {
          setCameraError(
            "Caméra inaccessible. Vérifiez les autorisations du navigateur, ou utilisez la saisie manuelle ci-dessous."
          );
        }
      });

    return () => {
      cancelled = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          /* déjà arrêtée ou jamais démarrée : sans conséquence */
        });
    };
  }, []);

  if (cameraError) {
    return (
      <p className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm text-danger">
        {cameraError}
      </p>
    );
  }

  return (
    <div
      id={CONTAINER_ID}
      className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl shadow-md"
    />
  );
}
