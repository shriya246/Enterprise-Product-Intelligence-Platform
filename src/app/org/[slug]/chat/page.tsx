import { requireOrgMembership } from "@/lib/org";
import { ChatPanel } from "./chat-panel";

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await requireOrgMembership(slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">AI Assistant</h1>
        <p className="text-sm text-neutral-500">
          Answers are grounded in your org&apos;s own analytics and feedback data.
        </p>
      </div>
      <ChatPanel orgId={org.orgId} />
    </div>
  );
}
