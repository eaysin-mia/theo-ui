"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@workspace/ui/lib/utils";
import {
  CheckIcon,
  CopyIcon,
  RefreshCcwIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@workspace/ui/components/message";
import { Bubble, BubbleContent } from "@workspace/ui/components/bubble";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@workspace/ui/components/attachment";
import { FileType, getFileType } from "@workspace/ui/components/file-type";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Trace } from "@workspace/ui/components/trace";
import { MarkdownPre } from "@/components/chat/markdown-code";
import { ReasoningPart } from "@/components/chat/parts/reasoning-part";
import {
  SourcesPart,
  type SourceItem,
} from "@/components/chat/parts/sources-part";
import {
  ToolPart,
  type ToolPartProps,
} from "@/components/chat/parts/tool-part";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  text: string;
  model?: string;
  reasoning?: string;
  reasoningDuration?: number;
  sources?: SourceItem[];
  tools?: ToolPartProps[];
  attachments?: {
    name: string;
    size: string;
    state?: "idle" | "uploading" | "processing" | "error" | "done";
  }[];
  variant?: "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost";
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  onRetry,
}: {
  message: ChatMessageItem;
  onRetry?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message.text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  if (message.role === "user") {
    return (
      <Message align="end">
        <MessageContent className="items-end">
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentGroup
              grid={message.attachments.length > 1}
              wrap={message.attachments.length === 1}
              className={cn(
                "self-end",
                message.attachments.length === 1
                  ? "max-w-xs justify-end"
                  : "max-w-md grid-cols-1 sm:grid-cols-2",
              )}
            >
              {message.attachments.map((att, i) => (
                <Attachment key={i} size="default" state={att.state ?? "done"}>
                  <AttachmentMedia variant="icon">
                    <FileType
                      type={getFileType(att.name)}
                      variant="outline"
                      size="default"
                    />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle className="text-sm font-medium">
                      {att.name}
                    </AttachmentTitle>
                    <AttachmentDescription className="text-xs text-muted-foreground">
                      {att.size}
                    </AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              ))}
            </AttachmentGroup>
          )}
          <Bubble align="end" variant="default">
            <BubbleContent className="text-sm">{message.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message align="start">
      <MessageContent className="items-start">
        {message.model && (
          <MessageHeader className="flex items-center gap-1.5 px-0 text-xs font-medium text-muted-foreground">
            <SparklesIcon
              className="size-3.5 text-primary"
              aria-hidden="true"
            />
            <span>{message.model}</span>
          </MessageHeader>
        )}

        {(message.reasoning || (message.tools && message.tools.length > 0)) && (
          <Trace>
            {message.reasoning && (
              <ReasoningPart
                text={message.reasoning}
                isStreaming={message.isStreaming}
                duration={message.reasoningDuration}
              />
            )}

            {message.tools?.map((tool, idx) => (
              <ToolPart key={idx} {...tool} />
            ))}
          </Trace>
        )}

        {message.sources && message.sources.length > 0 && (
          <SourcesPart sources={message.sources} />
        )}

        <div className="w-full text-sm leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{ pre: MarkdownPre }}
          >
            {message.text}
          </ReactMarkdown>
        </div>

        <MessageFooter className="gap-1 px-0 pt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleCopy}
                    aria-label={copied ? "Copied" : "Copy response"}
                  />
                }
              >
                {copied ? (
                  <CheckIcon className="size-3.5 text-emerald-500" />
                ) : (
                  <CopyIcon className="size-3.5" />
                )}
              </TooltipTrigger>
              <TooltipPopup>
                {copied ? "Copied!" : "Copy response"}
              </TooltipPopup>
            </Tooltip>

            {onRetry && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={onRetry}
                      aria-label="Regenerate"
                    />
                  }
                >
                  <RefreshCcwIcon className="size-3.5" />
                </TooltipTrigger>
                <TooltipPopup>Regenerate response</TooltipPopup>
              </Tooltip>
            )}
          </TooltipProvider>
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
