import ProtectedRoute from '@/components/shared/ProtectedRoute';
import HabitList from '@/components/habits/HabitList';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <HabitList />
    </ProtectedRoute>
  );
}
