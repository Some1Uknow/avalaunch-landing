"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  label: string;
  text: string;
};

const messages: ChatMessage[] = [
  {
    role: "user",
    label: "Launch prompt",
    text: "Launch a local Avalanche L1 called payments-dev with PAY as gas.",
  },
  {
    role: "assistant",
    label: "AvaLaunch",
    text: "I’ll collect the config, generate the launch plan, and wait for approval before running anything.",
  },
  {
    role: "user",
    label: "Requirements",
    text: "Use Subnet-EVM and Proof of Authority validation.",
  },
  {
    role: "assistant",
    label: "AvaLaunch",
    text: "Plan ready: create config, deploy locally, capture RPC, chain ID, blockchain ID, subnet ID, VM ID, logs, and status.",
  },
];

type VisibleMessage = ChatMessage & {
  text: string;
  isTyping?: boolean;
  isLoading?: boolean;
};

export function HeroWorkflowDemo() {
  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    const clearAll = () => {
      timeouts.current.forEach((timeout) => window.clearTimeout(timeout));
      timeouts.current = [];
    };

    const queue = (fn: () => void, delay: number) => {
      const timeout = window.setTimeout(fn, delay);
      timeouts.current.push(timeout);
    };

    const playSequence = () => {
      setVisibleMessages([]);

      let totalDelay = 0;

      messages.forEach((message) => {
        if (message.role === "assistant") {
          queue(() => {
            setVisibleMessages((current) => [
              ...current,
              { ...message, text: "", isLoading: true },
            ]);
          }, totalDelay + 240);

          totalDelay += 920;

          queue(() => {
            setVisibleMessages((current) => {
              const next = [...current];
              next[next.length - 1] = { ...message, text: "", isTyping: true };
              return next;
            });
          }, totalDelay);
        } else {
          queue(() => {
            setVisibleMessages((current) => [
              ...current,
              { ...message, text: "", isTyping: true },
            ]);
          }, totalDelay);
        }

        for (let index = 0; index < message.text.length; index += 1) {
          queue(
            () => {
              setVisibleMessages((current) => {
                const next = [...current];
                const last = next[next.length - 1];

                if (!last) {
                  return current;
                }

                next[next.length - 1] = {
                  ...last,
                  text: message.text.slice(0, index + 1),
                  isTyping: index + 1 !== message.text.length,
                  isLoading: false,
                };

                return next;
              });
            },
            totalDelay + 26 * (index + 1),
          );
        }

        totalDelay += 26 * message.text.length + 900;
      });

      queue(playSequence, totalDelay + 1200);
    };

    playSequence();

    return clearAll;
  }, []);

  const footerTags = useMemo(() => ["Config", "Plan", "Deploy", "Manage"], []);

  return (
    <div className="chat-demo-shell" aria-label="Product chat demo">
      <div className="chat-demo-topbar">
        <div className="chat-demo-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="chat-demo-title">
          <Image
            src="/avalaunch_branding_white.png"
            alt="AvaLaunch"
            width={1672}
            height={941}
            className="brand-lockup-image"
            priority
          />{" "}
        </div>
        <div className="chat-demo-status">live</div>
      </div>

      <div className="chat-demo-body">
        {visibleMessages.map((message, index) => (
          <div
            className={`chat-line ${
              message.role === "user" ? "chat-line-user" : "chat-line-assistant"
            }`}
            key={`${message.role}-${index}`}
          >
            <div className="chat-chip">{message.label}</div>
            <div className="chat-copy">
              {message.isLoading ? (
                <span className="typing-loader" aria-label="Loading response">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <>
                  {message.text}
                  {message.isTyping ? (
                    <span className="typing-caret" aria-hidden="true" />
                  ) : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-demo-footer">
        {footerTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
