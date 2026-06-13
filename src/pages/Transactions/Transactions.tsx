import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CreditCard } from "lucide-react";

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

const transactionsMock: Transaction[] = [
  {
    stripePaymentIntentId: "pi_3TZrxgRvo2QeFJ2k0tH3D7o8",
    customer: "cus_UVyR6Up7MCL1kF",
    amount: 29.99,
    amountReceived: 0,
    currency: "usd",
    description: null,
    paymentMethod: null,
    status: "canceled",
    canRetry: false,
    createdAt: "2026-05-22T12:13:56.000Z",
  },
  {
    stripePaymentIntentId: "pi_3TVJycRvo2QeFJ2k1kEUW419",
    customer: null,
    amount: 20,
    amountReceived: 20,
    currency: "usd",
    description: "(created by Stripe CLI)",
    paymentMethod: "pm_1TVJycRvo2QeFJ2kPFlVN1Rr",
    status: "succeeded",
    canRetry: false,
    createdAt: "2026-05-09T23:08:06.000Z",
  },
  {
    stripePaymentIntentId: "pi_3TTNNMRvo2QeFJ2k07POVGFu",
    customer: null,
    amount: 20,
    amountReceived: 20,
    currency: "usd",
    description: "(created by Stripe CLI)",
    paymentMethod: "pm_1TTNNMRvo2QeFJ2kinPcCPB9",
    status: "succeeded",
    canRetry: false,
    createdAt: "2026-05-04T14:21:36.000Z",
  },
  {
    stripePaymentIntentId: "pi_3THnjDRvo2QeFJ2k1d3jPvAO",
    customer: "cus_UGCIxxPn4h3rBl",
    amount: 205,
    amountReceived: 205,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: "pm_1THfuHRvo2QeFJ2kyMKxW8sG",
    status: "succeeded",
    canRetry: false,
    orderId: "ORDER_MNHO0FC1BSTV9",
    createdAt: "2026-04-02T16:04:19.000Z",
  },
  {
    stripePaymentIntentId: "pi_3TFYa3Rvo2QeFJ2k0e6g8U4W",
    customer: "cus_UDrjqfZTcYSFuv",
    amount: 130000,
    amountReceived: 130000,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: "pm_1TFYaRRvo2QeFJ2k0Sxw3On5",
    status: "succeeded",
    canRetry: false,
    orderId: "ORDER_MN8TJZZ4T99TD",
    createdAt: "2026-03-27T11:29:35.000Z",
  },
  {
    stripePaymentIntentId: "pi_3TFN81Rvo2QeFJ2k0cgfIM74",
    customer: "cus_U0OsHgRHBBERZe",
    amount: 200,
    amountReceived: 200,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: "pm_1T82yiRvo2QeFJ2k563Hj8JM",
    status: "succeeded",
    canRetry: false,
    orderId: "ORDER_MN83CFQPT80PB",
    createdAt: "2026-03-26T23:15:53.000Z",
  },
  {
    stripePaymentIntentId: "pi_3T95UsRvo2QeFJ2k1JZoje1O",
    customer: "cus_Tzu5Dc4uCzrrUs",
    amount: 130000,
    amountReceived: 130000,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: "pm_1T3Q9vRvo2QeFJ2kLsYlG9jI",
    status: "succeeded",
    canRetry: false,
    orderId: "ORDER_MMJBMM3H7NC56",
    createdAt: "2026-03-09T15:13:30.000Z",
  },
  {
    stripePaymentIntentId: "pi_3T7zURRvo2QeFJ2k1lN2WBU9",
    customer: "cus_Tzu5Dc4uCzrrUs",
    amount: 600,
    amountReceived: 600,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: "pm_1T7zUmRvo2QeFJ2kmIfWFVoH",
    status: "succeeded",
    canRetry: false,
    orderId: "ORDER_MMEZZIC9AHHSO",
    createdAt: "2026-03-06T14:36:31.000Z",
  },
  {
    stripePaymentIntentId: "pi_3T7FdXRvo2QeFJ2k17fOUyyM",
    customer: "cus_Tzu5Dc4uCzrrUs",
    amount: 200,
    amountReceived: 200,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: "pm_1T7Fe9Rvo2QeFJ2kBekUfL0D",
    status: "succeeded",
    canRetry: false,
    orderId: "ORDER_MMC31NB6FH9B2",
    createdAt: "2026-03-04T13:38:51.000Z",
  },
  {
    stripePaymentIntentId: "pi_3T7Fc7Rvo2QeFJ2k19gmkKF5",
    customer: "cus_Tzu5Dc4uCzrrUs",
    amount: 130000,
    amountReceived: 0,
    currency: "usd",
    description: "ROVEX Order",
    paymentMethod: null,
    status: "requires_payment_method",
    canRetry: true,
    orderId: "ORDER_MMC2ZQXUDHMOW",
    createdAt: "2026-03-04T13:37:23.000Z",
  },
];

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

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

const Transactions = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);

  const transactions = useMemo(() => {
    void refreshTick;
    if (selectedStatus === "all") return transactionsMock;
    return transactionsMock.filter((transaction) => transaction.status === selectedStatus);
  }, [selectedStatus, refreshTick]);

  const statusFilters = [
    { value: "all", label: "All statuses" },
    { value: "succeeded", label: "Succeeded" },
    { value: "canceled", label: "Canceled" },
    { value: "requires_payment_method", label: "Requires Payment" },
  ];

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-[#2ec8cf]" />
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
            {/* <select
              className="h-9 rounded-md border border-input bg-muted/30 px-3 text-xs font-medium focus:ring-2 focus:ring-[#2ec8cf] transition-all min-w-[170px]"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value} className="dark:bg-[#0f172a]">
                  {filter.label}
                </option>
              ))}
            </select> */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshTick((prev) => prev + 1)}
              className="border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                      No transactions match the selected status.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.stripePaymentIntentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{transaction.stripePaymentIntentId}</td>
                      <td className="px-4 py-3 font-mono text-xs">{transaction.customer ?? "—"}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(transaction.amountReceived, transaction.currency)}
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
