import type { Metadata } from "next";
import { ChatView } from "@/components/chat/ChatView";
import { getChat } from "@/lib/actions/chat";

export const metadata: Metadata = { title: "chat · nari." };

export default async function ChatPage() {
  const data = await getChat();
  return <ChatView data={data} />;
}
