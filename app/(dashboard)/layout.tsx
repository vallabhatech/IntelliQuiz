import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/join");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-gradient">IntelliQuiz</span>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
