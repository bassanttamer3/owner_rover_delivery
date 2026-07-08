import { FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { deleteCustomer, getAllCustomers, searchForCustomer } from "@/api/customers/customers";
import { Customer, ListCusotmersParamsInterface } from "@/common";
import { useNavigate } from "react-router-dom";



const Customers = () => {
  const navigate = useNavigate();
  const PAGE_SIZE = 10;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [startingAfter, setStartingAfter] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    customerId: string;
    customerName: string;
  }>({
    open: false,
    customerId: "",
    customerName: "",
  });

  const fetchCustomers = async (cursor?: string) => {
    setListLoading(true);
    try {
      const params: ListCusotmersParamsInterface = {
        limit: PAGE_SIZE,
        ...(cursor ? { starting_after: cursor } : {}),
      };
      const res = await getAllCustomers(params);
      setCustomers(res.data.data);
      setHasMore(res.data.data.length === PAGE_SIZE);
    } catch {
      toast.error("Failed to fetch customers");
      setCustomers([]);
      setHasMore(false);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(undefined);
  }, []);

  const handleSync = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setStartingAfter(undefined);
    setCursorHistory([]);
    fetchCustomers(undefined);
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = generateSearchQuery(searchQuery);

    if (!query) {
      setIsSearchMode(false);
      setStartingAfter(undefined);
      setCursorHistory([]);
      fetchCustomers(undefined);
      return;
    }

    try {
      setListLoading(true);
      setIsSearchMode(true);
      setStartingAfter(undefined);
      setCursorHistory([]);
      setHasMore(false);

      const res = await searchForCustomer(query);
      console.log(res.data.data);
      const data = res?.data?.data;
      const resolvedCustomers = data?.customers ?? data?.data ?? data ?? [];
      setCustomers(Array.isArray(resolvedCustomers) ? resolvedCustomers : []);
    } catch {
      toast.error("Failed to search customers");
      setCustomers([]);
    } finally {
      setListLoading(false);
    }
  };

  const handleNext = () => {
    if (listLoading || customers.length === 0) return;
    const lastCustomerId = customers[customers.length - 1]?.stripeCustomerId;
    if (!lastCustomerId || lastCustomerId === "N/A") return;

    setCursorHistory((prev) => [...prev, startingAfter ?? ""]);
    setStartingAfter(lastCustomerId);
    fetchCustomers(lastCustomerId);
  };

  const handlePrevious = () => {
    if (listLoading || cursorHistory.length === 0) return;
    const previousCursor = cursorHistory[cursorHistory.length - 1];
    const normalizedCursor = previousCursor || undefined;

    setCursorHistory((prev) => prev.slice(0, -1));
    setStartingAfter(normalizedCursor);
    fetchCustomers(normalizedCursor);
  };

  const openDeleteConfirm = (customer: Customer) => {
    setDeleteConfirm({
      open: true,
      customerId: customer.stripeCustomerId,
      customerName: customer.name || customer.email || "this customer",
    });
  };

  const handleOpenProfile = (customerId: string) => {
    if (!customerId || customerId === "N/A") return;
    navigate(`/customers/${customerId}`);
  };

  const handleDeleteCustomer = async () => {
    if (!deleteConfirm.customerId) return;
    try {
      setDeleteLoading(true);
      await deleteCustomer(deleteConfirm.customerId);
      toast.success("Customer deleted successfully");
      setDeleteConfirm({ open: false, customerId: "", customerName: "" });
      await fetchCustomers(startingAfter);
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeleteLoading(false);
    }
  };

  const generateSearchQuery = (searchKey: string): string => {
    const normalizedKey = searchKey.trim();
    if (!normalizedKey) return "";

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedKey);
    return isEmail ? `email:"${normalizedKey}"` : `name:"${normalizedKey}"`;
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          {/* <Users className="h-7 w-7 text-[#2ec8cf]" /> */}
          Customers
        </h1>
        <p className="text-muted-foreground text-sm">View and manage customer records</p>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0 pb-4 bg-muted/20 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold">Customer List</CardTitle>
            <CardDescription>
              {customers.length} {customers.length === 1 ? "customer" : "customers"}
            </CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="h-8 w-72 bg-background text-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={listLoading}
              className="h-8 px-2.5 bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search
            </Button>
            {isSearchMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={listLoading}
                className="h-8 px-2.5"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchMode(false);
                  setStartingAfter(undefined);
                  setCursorHistory([]);
                  fetchCustomers(undefined);
                }}
              >
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={listLoading}
              className="h-8 px-2.5 border-[#2ec8cf]/50 text-[#2ec8cf] hover:bg-[#2ec8cf]/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${listLoading ? "animate-spin" : ""}`} />
              Sync
            </Button>
          </form>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/40">
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Default Payment Method
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {listLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.stripeCustomerId}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleOpenProfile(customer.stripeCustomerId)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{customer.name || "-"}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {customer.stripeCustomerId}
                        </div>
                      </td>
                      <td className="px-4 py-3">{customer.email}</td>
                      <td className="px-4 py-3">{customer.phone || "-"}</td>
                      <td className="px-4 py-3">{customer.defaultPaymentMethod || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(customer);
                          }}
                          aria-label={`Delete ${customer.name || customer.email || "customer"}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!listLoading && customers.length > 0 && !isSearchMode && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={cursorHistory.length === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasMore}
                className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90 text-white border-0 disabled:bg-muted disabled:text-muted-foreground"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => {
          if (deleteLoading) return;
          setDeleteConfirm((prev) =>
            open ? prev : { open: false, customerId: "", customerName: "" },
          );
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm customer deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {`You are about to delete `}
              <span className="font-semibold text-primary">
                {deleteConfirm.customerName || "this customer"}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Deleting..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
