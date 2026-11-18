"use client";

import * as React from "react";
import { useState } from "react";
import {
  ArrowUpIcon,
  BotIcon,
  FileTextIcon,
  PaperclipIcon,
  RotateCcwIcon,
  SparklesIcon,
  SquareIcon,
  Trash2Icon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@workspace/ui/components/message-scroller";
import {
  Composer,
  ComposerActionGroup,
  ComposerActions,
  ComposerInput,
  ComposerItem,
  type ComposerItemValue,
  ComposerList,
  ComposerPopup,
  ComposerSubmit,
  type ComposerTrigger,
  type ComposerValue,
  getComposerText,
} from "@workspace/ui/components/composer";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentAction,
  AttachmentActions,
} from "@workspace/ui/components/attachment";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Button } from "@workspace/ui/components/button";
import { FileType, getFileType } from "@workspace/ui/components/file-type";
import { Message, MessageContent } from "@workspace/ui/components/message";
import {
  ChatMessage,
  type ChatMessageItem,
} from "@/components/chat/chat-message";
import { ModelSelect, AVAILABLE_MODELS } from "@/components/chat/model-select";
import { XIcon } from "lucide-react";

const INITIAL_MESSAGES: ChatMessageItem[] = [
  {
    id: "msg-1",
    role: "user",
    text: "Can you analyze this project structure and explain how Coss UI components and Shadcn AI elements interact?",
    attachments: [
      { name: "architecture-spec.md", size: "24.5 KB", state: "done" },
      { name: "composer-engine.ts", size: "12.8 KB", state: "done" },
    ],
  },
  {
    id: "msg-2",
    role: "assistant",
    model: "Claude 3.7 Sonnet",
    reasoning:
      "1. Inspecting workspace packages and `@workspace/ui` exports.\n2. Checking Base UI `useRender` primitives.\n3. Analyzing `Composer`, `MessageScroller`, `Bubble`, and `CodeBlock` composition.\n4. Evaluating layout integration with Next.js App Router.",
    reasoningDuration: 2400,
    tools: [
      {
        toolName: "Codebase Search",
        queryOrTarget: "packages/ui/src/components/*",
        status: "pending",
        duration: 800,
        output: {
          scannedFiles: 42,
          primitivesFound: [
            "Composer",
            "MessageScroller",
            "Bubble",
            "CodeBlock",
            "Attachment",
            "Item",
          ],
          status: "healthy",
        },
      },
      {
        toolName: "Web Search",
        queryOrTarget: "Coss UI and Base UI integration",
        status: "pending",
        duration: 1200,
      },
    ],
    sources: [
      {
        title: "Coss UI Docs - Composer",
        url: "https://coss.com/ui/docs/components/composer",
      },
      {
        title: "Shadcn AI Elements",
        url: "https://ui.shadcn.com/docs/ai-elements",
      },
    ],
    text: `Here is the architectural overview of how **Coss UI** and the **AI Elements** function together:

### Key Highlights
- **Input Pipeline**: Powered by \`Composer\`. Features autosizing, tokenized mentions (\`@\`), slash commands (\`/\`), and action bars.
- **Feed Virtualization**: Handled by \`MessageScroller\`, maintaining smooth anchoring as streaming tokens arrive.
- **Rich Message Content**: Built using semantic \`Bubble\` variants, styled \`Trace\` collapsible lines for reasoning, and syntax-highlighted \`CodeBlock\` containers.

Here is an example snippet showing how you compose the feed:

\`\`\`tsx
import { MessageScroller, MessageScrollerContent } from "@workspace/ui/components/message-scroller";
import { Message, MessageContent } from "@workspace/ui/components/message";
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";

export function ChatFeed({ messages }) {
  return (
    <MessageScroller>
      <MessageScrollerContent>
        {messages.map((m) => (
          <Message key={m.id} align={m.role === "user" ? "end" : "start"}>
            <MessageContent>
              <Bubble variant={m.role === "user" ? "default" : "muted"}>
                <BubbleContent>{m.text}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        ))}
      </MessageScrollerContent>
    </MessageScroller>
  );
}
\`\`\`

Feel free to ask for sample data or interactive component states!`,
    variant: "muted",
  },
];

const SUGGESTIONS = [
  "Showcase Shiki code highlighting with TypeScript",
  "Demonstrate multi-step reasoning with Trace",
  "Test all Bubble variants (tinted, secondary, outline)",
  "Simulate file attachment upload states",
];

const PEOPLE = [
  { id: "alex", label: "Alex Morgan", kind: "person" },
  { id: "sam", label: "Sam Rivera", kind: "person" },
  { id: "taylor", label: "Taylor Kim", kind: "person" },
];

const TEAMS = [
  { id: "design", label: "Design Team", kind: "team" },
  { id: "engineering", label: "Engineering Team", kind: "team" },
];

const SLASH_ACTIONS = [
  { id: "summarize", label: "Summarize", type: "action" as const },
  { id: "code", label: "Generate Code", type: "action" as const },
  { id: "search", label: "Search Knowledgebase", type: "action" as const },
];

const TRIGGERS: ComposerTrigger[] = [
  { character: "@", items: [...PEOPLE, ...TEAMS] },
  { character: "/", items: SLASH_ACTIONS },
];

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessageItem[]>(INITIAL_MESSAGES);
  const [selectedModel, setSelectedModel] = useState<string>(
    AVAILABLE_MODELS[0]?.id ?? "claude-3-7-sonnet",
  );
  const [composerValue, setComposerValue] = useState<ComposerValue>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stagedAttachments, setStagedAttachments] = useState<
    {
      name: string;
      size: string;
      state: "idle" | "uploading" | "processing" | "done";
    }[]
  >([]);

  const handleSend = (textToSend?: string) => {
    const rawText = textToSend ?? getComposerText(composerValue);
    const text = rawText.trim();
    if (!text || isGenerating) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      attachments:
        stagedAttachments.length > 0 ? [...stagedAttachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setComposerValue([]);
    setStagedAttachments([]);
    setIsGenerating(true);

    // Simulated realistic streaming AI response
    setTimeout(() => {
      const assistantMessage: ChatMessageItem = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        model:
          AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name ??
          selectedModel,
        reasoning:
          "1. Parsing user query...\n2. Querying knowledgebase...\n3. Synthesizing response with Coss UI design standards.",
        reasoningDuration: 1800,
        tools: [
          {
            toolName: "Web Search",
            queryOrTarget: text.slice(0, 40),
            status: "pending",
            duration: 900,
            output: { resultsFound: 3, verified: true },
          },
        ],
        sources: [
          { title: "Documentation Reference", url: "https://coss.com/ui" },
        ],
        text: `You asked: "**${text}**"\n\nHere is a live response using Coss UI AI elements. All components support dark mode, responsive styling, and accessible keyboard navigation.\n\n\`\`\`python\ndef ai_response():\n    return "Generated smoothly with zero errors!"\n\`\`\``,
        variant: "muted",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAddAttachment = () => {
    const sampleFiles = [
      { name: "metrics-chart.png", size: "320 KB", state: "done" as const },
      { name: "report-data.json", size: "54 KB", state: "done" as const },
      { name: "analysis.csv", size: "1.2 MB", state: "processing" as const },
      { name: "architecture-spec.md", size: "24.5 KB", state: "done" as const },
      { name: "composer-engine.ts", size: "12.8 KB", state: "done" as const },
      { name: "design-system.fig", size: "14.2 MB", state: "done" as const },
    ];
    const nextFile = sampleFiles[stagedAttachments.length % sampleFiles.length];
    if (nextFile) {
      setStagedAttachments((prev) => [...prev, nextFile]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setStagedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex size-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex size-full items-center justify-center p-6">
            <Empty>
              <EmptyMedia variant="icon">
                <BotIcon className="size-5 text-primary" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>AI Chat Interface</EmptyTitle>
                <EmptyDescription>
                  Explore all AI components: MessageScroller, Composer, Bubble,
                  CodeBlock, Trace, and Attachments.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="size-full">
              <MessageScrollerViewport className="p-4 md:p-6">
                <MessageScrollerContent className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-6">
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.role === "user"}
                    >
                      <ChatMessage
                        message={message}
                        onRetry={
                          message.role === "assistant" && !isGenerating
                            ? () =>
                                handleSend(
                                  "Regenerate with additional depth and examples.",
                                )
                            : undefined
                        }
                      />
                    </MessageScrollerItem>
                  ))}

                  {isGenerating && (
                    <MessageScrollerItem messageId="generating" scrollAnchor>
                      <Message align="start">
                        <MessageContent className="items-start">
                          <div className="shimmer flex items-center gap-2 text-xs text-muted-foreground">
                            <SparklesIcon className="size-3.5 animate-spin text-primary" />
                            <span>Generating response...</span>
                          </div>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>

      {/* Composer Input Area */}
      <div className="shrink-0 bg-transparent p-3 md:p-4">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {/* Staged Attachments */}
          {stagedAttachments.length > 0 && (
            <AttachmentGroup wrap className="pb-1">
              {stagedAttachments.map((att, i) => (
                <Attachment key={i} size="sm" state={att.state}>
                  <AttachmentMedia variant="icon">
                    <FileType
                      type={getFileType(att.name)}
                      variant="outline"
                      size="sm"
                    />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle className="text-xs font-medium">
                      {att.name}
                    </AttachmentTitle>
                    <AttachmentDescription className="text-[11px] text-muted-foreground">
                      {att.size}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      onClick={() => handleRemoveAttachment(i)}
                      aria-label="Remove"
                      title="Remove attachment"
                    >
                      <XIcon className="size-3" />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}

          {/* Composer Form */}
          <Composer
            value={composerValue}
            onValueChange={setComposerValue}
            triggers={TRIGGERS}
            onSubmit={() => handleSend()}
            className="w-full"
          >
            <ComposerInput
              aria-label="Prompt message"
              placeholder="Ask anything... Use @ for mentions, / for commands"
              className="text-sm"
            />

            {/* Mention / Slash Command Suggestions Popup */}
            <ComposerPopup>
              <ComposerList>
                {(item: ComposerItemValue) => (
                  <ComposerItem key={item.id} value={item}>
                    {item.type === "action" ? (
                      <SparklesIcon
                        aria-hidden="true"
                        className="size-4 text-primary opacity-80"
                      />
                    ) : item.kind === "team" ? (
                      <UsersRoundIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground opacity-80"
                      />
                    ) : (
                      <UserRoundIcon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground opacity-80"
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                  </ComposerItem>
                )}
              </ComposerList>
            </ComposerPopup>

            <ComposerActions>
              <ComposerActionGroup align="start">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleAddAttachment}
                  aria-label="Attach file"
                  title="Add sample attachment"
                >
                  <PaperclipIcon className="size-4" />
                </Button>
                <span className="hidden text-[11px] text-muted-foreground sm:inline-block">
                  Type{" "}
                  <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                    @
                  </kbd>{" "}
                  or{" "}
                  <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                    /
                  </kbd>
                </span>
              </ComposerActionGroup>

              <ComposerActionGroup align="end">
                <ModelSelect
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                />
                {isGenerating ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setIsGenerating(false)}
                    aria-label="Stop generation"
                    title="Stop generation"
                  >
                    <SquareIcon className="size-3.5 fill-current" />
                  </Button>
                ) : (
                  <ComposerSubmit
                    render={
                      <Button
                        size="icon-sm"
                        variant="default"
                        aria-label="Send message"
                        title="Send message"
                      />
                    }
                  >
                    <ArrowUpIcon className="size-4" />
                  </ComposerSubmit>
                )}
              </ComposerActionGroup>
            </ComposerActions>
          </Composer>
        </div>
      </div>
    </div>
  );
}
