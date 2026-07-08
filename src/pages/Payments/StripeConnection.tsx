import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import {
  authorizeStripe,
  getStripeStatus,
  getOnboardingLink,
  disconnectStripe,
} from "@/api/companies/companies";
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
import { useAuth } from "@/contexts/AuthContext";
import { StripeStatusResponse } from "@/common/interfaces/companies/companies.interfaces";

export default function StripeConnection({
  onVerificationSuccess,
  isMiniView,
}: {
  onVerificationSuccess?: () => void;
  isMiniView?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<StripeStatusResponse | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const connectStatus = searchParams.get("connect");
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user?.company_id) return;
    try {
      const response = await getStripeStatus(user.company_id);
      setStripeStatus(response.data);
      if (response.data.isFullyActivated) {
        onVerificationSuccess?.();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setStatusLoading(false);
    }
  }, [user?.company_id, onVerificationSuccess]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      const payload = {
        companyId: user?.company_id as string,
        email: user?.email as string,
        name: user?.name as string,
      };
      const response = await authorizeStripe(payload);
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeOnboarding = async () => {
    setLoading(true);
    try {
      const response = await getOnboardingLink(user?.company_id as string);
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectStripe(user?.company_id as string);
      await fetchStatus();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isMiniView) {
    return (
      <div className="space-y-6 p-6 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <CardTitle>Stripe Integration </CardTitle>
        
        {stripeStatus?.isFullyActivated && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border  text-[10px] font-medium shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            Account Verified
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Your Stripe account is currently active. Payouts and payments are being processed normally.
      </p>
        <Button
          variant="ghost"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="w-full justify-start px-0 text-xs text-red-500 hover:text-red-600 hover:bg-transparent"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Disconnect Stripe Account
        </Button>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent className="rounded-[1.5rem] border-border/50 bg-card z-[999]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black">Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to proceed? This will disconnect your Stripe account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="border-none bg-muted rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDisconnect();
                  setShowConfirm(false);
                }}
                className="rounded-xl bg-[#2ec8cf] text-white hover:bg-[#2ec8cf]/90"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <CreditCard className="w-5 h-5" />
          Stripe Connect
        </CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Link your bank account to receive payouts and manage payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 p-8 text-center">
          {stripeStatus?.isFullyActivated ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Account Verified</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Your account is fully connected and ready to receive payments.
              </p>
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="text-xs text-gray-400 hover:text-red-500 hover:bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Disconnect Account
              </Button>
            </div>
          ) : stripeStatus?.isConnected ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-800">Action Required</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Your account is connected but needs more info on Stripe.
              </p>
              <Button onClick={handleResumeOnboarding} disabled={loading} className="bg-[#2ec8cf] text-white">
                Complete Onboarding
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                You will be redirected to Stripe to complete your onboarding process.
              </p>
              <Button
                onClick={handleConnectStripe}
                disabled={loading}
                className="w-full bg-[#2ec8cf] text-white hover:bg-[#2ec8cf]/90"
              >
                Connect with Stripe
              </Button>
            </>
          )}
        </div>
      </CardContent>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="rounded-[1.5rem] border-border/50 bg-card z-[999]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black">Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to proceed? This will disconnect your Stripe account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-none bg-muted rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDisconnect();
                setShowConfirm(false);
              }}
              className="rounded-xl bg-[#2ec8cf] text-white hover:bg-[#2ec8cf]/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}