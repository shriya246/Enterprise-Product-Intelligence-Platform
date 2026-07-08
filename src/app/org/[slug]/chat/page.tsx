import { requireOrgMembership } from "@/lib/org";
import { PageHeader } from "@/components/ui/page-header";
import { ChatPanel } from "./chat-panel";

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="AI Assistant"
        description="Answers are grounded in your org's own analytics and feedback data."
      />
      <ChatPanel orgId={org.orgId} />
    </div>
  );
}
