import type { Metadata } from "next";
import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = {
  title: "AI Chat - Coss UI Elements",
  description:
    "Interactive AI Chat review showcasing MessageScroller, Composer, Bubble, CodeBlock, and Trace.",
};

export default function ChatPage() {
  return <ChatView />;
}
