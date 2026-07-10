// EMP-18: Benefit Balance ledger removed per management decision.
// Any direct URL visits are redirected to the dashboard.
import { redirect } from "next/navigation";

export default function BalancePage() {
  redirect("/");
}
