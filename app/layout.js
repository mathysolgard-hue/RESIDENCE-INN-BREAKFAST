import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'Petit-déjeuner | Residence Inn by Marriott Lille',
  description:
    "Réservez votre créneau de petit-déjeuner à l'hôtel Residence Inn by Marriott Lille en quelques secondes.",
};

export const viewport = {
  themeColor: '#164a37',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen bg-[#f7f6f3] font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
