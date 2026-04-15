"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { RebalanceEvent } from "@/lib/types";

interface RebalanceHistoryProps {
  data: RebalanceEvent[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenSig(sig: string): string {
  if (sig.length <= 12) return sig;
  return `${sig.slice(0, 6)}...${sig.slice(-4)}`;
}

export function RebalanceHistory({ data }: RebalanceHistoryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Rebalance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            No rebalance events yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Reallocation</TableHead>
                  <TableHead className="text-xs text-right">Amount</TableHead>
                  <TableHead className="text-xs">Reason</TableHead>
                  <TableHead className="text-xs text-right">Tx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((event) => (
                  <TableRow key={event.txSignature}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {event.fromProtocol}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs font-normal">
                          {event.toProtocol}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      ${event.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {event.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={`https://solscan.io/tx/${event.txSignature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {shortenSig(event.txSignature)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
