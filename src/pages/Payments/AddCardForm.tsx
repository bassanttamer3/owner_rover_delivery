import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface AddCardFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddCardForm({ onSuccess, onCancel }: AddCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    
    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message);
    } else if (setupIntent && setupIntent.status === "succeeded") {
      toast.success("Card verified successfully!");
      onSuccess();
    }
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-500">
      <PaymentElement />
      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={isProcessing || !stripe} 
          className="flex-1 bg-[#2ec8cf] hover:bg-[#2ec8cf]/90"
        >
          {isProcessing ? "Processing..." : "Save Card"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}