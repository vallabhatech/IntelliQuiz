import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/dashboard");
  }
  return <LandingPage />;
}
