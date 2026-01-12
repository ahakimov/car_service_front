import ProtectedRoute from "@/modules/layout/ProtectedRoute";

export default function Home() {
  return (
      <ProtectedRoute>
          <main className="min-h-screen">
            auth
          </main>
      </ProtectedRoute>
  );
}