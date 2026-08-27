import { getAvailability, listReservations } from '@/lib/actions';
import { todayParis } from '@/lib/time';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const date = todayParis();
  const [availability, reservations] = await Promise.all([
    getAvailability(date),
    listReservations(date),
  ]);

  return (
    <DashboardClient
      initialAvailability={availability}
      initialReservations={reservations}
      date={date}
    />
  );
}
