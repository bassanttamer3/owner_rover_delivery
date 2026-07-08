import { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Loader2, Trash2 } from "lucide-react";
import {
  createSetupIntent,
  getSetupIntentDetails,
  getCustomerPaymentMethods,
  deletePaymentMethod,
  getDefaultPaymentMethod,
  setDefaultPaymentMethod,
} from "@/api";
import { StripeCard } from "@/common/interfaces/companies/companies.interfaces";
import { toast } from "sonner";
import AddCardForm from "./AddCardForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PaymentMethods = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingCards, setFetchingCards] = useState(false);
  const [cards, setCards] = useState<StripeCard[]>([]);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [setupIntentId, setSetupIntentId] = useState<string>("");
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);
  const [defaultCardId, setDefaultCardId] = useState<string | null>(null);
  const fetchCards = async () => {
    setFetchingCards(true);
    try {
      const res = await getCustomerPaymentMethods("card");
      if (res.data.success) {
        const responseData = res.data.data as unknown as { data: StripeCard[] };
        setCards(responseData.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch cards", error);
    } finally {
      setFetchingCards(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleAddNewCard = async () => {
    setLoading(true);
    try {
      const payload = { paymentMethodTypes: ["card"] };
      const res = await createSetupIntent(payload);
      const { clientSecret, setupIntentId, publishableKey } = res.data.data;

      if (publishableKey) {
        setStripePromise(loadStripe(publishableKey));
        setClientSecret(clientSecret);
        setSetupIntentId(setupIntentId);
      }
    } catch (error) {
      toast.error("Failed to initialize payment setup");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchStatus = async () => {
    try {
      const res = await getSetupIntentDetails(setupIntentId);
      if (res.data.success) {
        setClientSecret(null);
        toast.success("Card added successfully!");
        fetchCards();
      }
    } catch (error) {
      console.error("Verification failed", error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const res = await deletePaymentMethod(cardId);
      if (res.data.success) {
        toast.success("Card deleted successfully");
        setCards((prev) => prev.filter((card) => card.id !== cardId));
      }
    } catch (error) {
      toast.error("Failed to delete card");
      console.error("Delete Error:", error);
    }
  };
const fetchDefaultCard = async () => {
  try {
    const res = await getDefaultPaymentMethod();
    if (res.data.success) {
      setDefaultCardId(res.data.data.id); 
    }
  } catch (error) {
    console.error("Failed to fetch default card", error);
  }
};
const handleSetDefault = async (cardId: string) => {
  try {
    const res = await setDefaultPaymentMethod(cardId);
    
    if (res.data.success) {
      const newDefaultId = res.data.data.invoice_settings.default_payment_method;
      
      setDefaultCardId(newDefaultId);
      toast.success("Default payment method updated");
    }
  } catch (error) {
    toast.error("Failed to update default card");
    console.error(error);
  }
};

  useEffect(() => {
    fetchCards();
    fetchDefaultCard();
  }, []);
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <p className="text-xs mt-2 text-muted-foreground leading-relaxed">
              Manage your cards and payment preferences
            </p>
          </div>
          {!clientSecret && (
            <Button
              onClick={handleAddNewCard}
              disabled={loading || fetchingCards}
              className="bg-[#2ec8cf] hover:bg-[#2ec8cf]/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add New Card
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {clientSecret && stripePromise ? (
            <div className="max-w-md mx-auto p-4 border rounded-xl bg-slate-50/50">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <AddCardForm
                  onSuccess={handleFetchStatus}
                  onCancel={() => setClientSecret(null)}
                />
              </Elements>
            </div>
          ) : fetchingCards ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#2ec8cf]" />
            </div>
          ) : cards.length > 0 ? (
            <div className="grid gap-4">
              {cards.map((card) => {
                const isDefault = card.id === defaultCardId;

                return (
                  <div
                    key={card.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${isDefault ? "border-[#2ec8cf] bg-[#2ec8cf]/5" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white border rounded-md">
                        <CreditCard className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">
                            {card.brand} •••• {card.last4}
                          </p>
                          {isDefault && (
                            <span className="text-[10px] bg-[#2ec8cf] text-white px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Expires {card.expMonth}/{card.expYear}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(card.id)}
                          className="text-xs"
                        >
                          Set as Default
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your card ending in{" "}
                              {card.last4}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCard(card.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-none"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <CreditCard className="w-12 h-12 mb-2 opacity-20" />
              <p>No payment methods added yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethods;
