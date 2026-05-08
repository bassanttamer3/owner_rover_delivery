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
import { CreditCard, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { 
  authorizeStripe, 
  getStripeStatus, 
  getOnboardingLink, 
  disconnectStripe 
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

export default function StripeConnection() {
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<StripeStatusResponse | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const connectStatus = searchParams.get('connect');

  const [showConfirm, setShowConfirm] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user?.company_id) return;
    try {
      const response = await getStripeStatus(user.company_id);
      setStripeStatus(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setStatusLoading(false);
    }
  }, [user?.company_id]);

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

  useEffect(() => {
    if (connectStatus === 'success') {
      fetchStatus();
    }
  }, [connectStatus, fetchStatus]);

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
        {connectStatus === 'success' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Stripe account linked successfully!</p>
          </div>
        )}

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
                className="text-xs text-gray-400 hover:text-red-500 hover:bg-transparent bg-transparent shadow-none border-none active:bg-transparent focus:bg-transparent"
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
              <div className="pt-2">
                <Button variant="ghost" onClick={() => setShowConfirm(true)} disabled={loading} className="text-xs text-gray-400 hover:text-[#2ec8cf] hover:bg-transparent bg-transparent shadow-none border-none active:bg-transparent focus:bg-transparent">
                  Cancel and start over
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                You will be redirected to Stripe to complete your onboarding process and verify your business account.
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
            <AlertDialogTitle className="font-black text-foreground">Confirm Action</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to proceed? This will disconnect your Stripe account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-none bg-muted text-muted-foreground rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDisconnect();
                setShowConfirm(false);
              }}
              className="rounded-xl bg-[#2ec8cf] text-white shadow-lg shadow-[#2ec8cf]/20 hover:bg-[#2ec8cf]/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}