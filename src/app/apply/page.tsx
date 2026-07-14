"use client";

import { ApplicationWizard } from "@/components/apply/ApplicationWizard";
import { Layout } from "@/components/layout/Layout";
import { useAppStore } from "@/store/appStore";

export default function ApplyPage() {
  const { currentUser } = useAppStore();

  return (
    <Layout
      title="Submit Application"
      breadcrumbs={[
        { label: "Overview", href: "/" },
        { label: "New Application" },
      ]}
      disableScroll={true}
    >
      <ApplicationWizard userRole={currentUser?.role ?? "employee"} />
    </Layout>
  );
}
