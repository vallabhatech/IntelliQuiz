"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ShareRoomCodeProps {
  roomCode: string;
}

export function ShareRoomCode({ roomCode }: ShareRoomCodeProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    toast.success("Room code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function copyLink() {
    const link = `${window.location.origin}/join?code=${roomCode}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Join link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Room Code</p>
        <p className="text-2xl font-bold tracking-widest font-mono">{roomCode}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          title="Copy room code"
        >
          {copiedCode ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{copiedCode ? "Copied!" : "Copy code"}</span>
        </button>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          title="Copy join link"
        >
          {copiedLink ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Copy link"}</span>
        </button>
      </div>
    </div>
  );
}
