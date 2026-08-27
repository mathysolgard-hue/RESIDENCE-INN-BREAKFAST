import Scanner from '@/components/dashboard/Scanner';

export default function ScannerPage() {
  return (
    <div>
      <h1 className="mb-1 font-serif text-xl font-semibold text-stone-900">Scanner d'entrée</h1>
      <p className="mb-4 text-sm text-stone-500">
        Scannez le QR code présenté par le client pour vérifier son créneau.
      </p>
      <Scanner />
    </div>
  );
}
