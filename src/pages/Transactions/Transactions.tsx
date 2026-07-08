import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { listAllPaymentIntents } from "@/api";
import { formatAmount, formatDate } from "@/pages/Subscriptions/subscription-utils";

type Transaction = {
  stripePaymentIntentId: string;
  customer: string | null;
  amount: number;
  amountReceived: number;
  currency: string;
  description: string | null;
  paymentMethod: string | null;
  status: string;
  canRetry: boolean;
  orderId?: string;
  createdAt: string;
};

function parsePaymentIntentsResponse(data: unknown): Transaction[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Transaction[];

  const record = data as Record<string, unknown>;
  const rows = record.paymentIntents ?? record.payments ?? record.data;
  return Array.isArray(rows) ? (rows as Transaction[]) : [];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  succeeded: {
    label: "Succeeded",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  },
  canceled: {
    label: "Canceled",
    className: "bg-rose-500/15 text-rose-600 border-rose-500/30",
  },
  requires_payment_method: {
    label: "Requires Payment",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge variant="outline" className={`font-normal border text-[11px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const fetchTransactions = async () => {
    setListLoading(true);
    try {
      const res = await listAllPaymentIntents();
      const rows = parsePaymentIntentsResponse(res.data?.data.items);
      setTransactions(rows);
    } catch {
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          {/* <CreditCard className="h-7 w-7 text-[#2ec8cf]" /> */}
          Transactions
        </h1>
        <p className="text-muted-foreground text-sm">
          Review payment history
        </p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Transactions</CardTitle>
            <CardDescription>
              {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              disabled={listLoading}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[1120px]">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Payment Intent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Amount Received
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-48" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-40" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-32" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.stripePaymentIntentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{transaction.stripePaymentIntentId}</td>
                      <td className="px-4 py-3 font-mono text-xs">{transaction.customer ?? "—"}</td>
                      <td className="px-4 py-3">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </td>
                      <td className="px-4 py-3">
                        {formatAmount(transaction.amountReceived, transaction.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {transaction.paymentMethod ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
