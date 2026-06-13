import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import StripeConnection from "./StripeConnection";
import PaymentMethods from "./PaymentMethods";
import { CheckCircle2 } from "lucide-react";

const Payments = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const isCompanyUser = userType === "company";
  
  // State to track if the Stripe account is fully verified
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isCompanyUser) {
      navigate("/");
      return;
    }

    const status = searchParams.get('connect');
    if (status === 'success') {
      toast.success("Stripe account linked successfully");
      navigate("/payments", { replace: true });
    } else if (status === 'failed') {
      toast.error("Failed to connect with Stripe.");
      navigate("/payments", { replace: true });
    }
  }, [searchParams, navigate, isCompanyUser]);

  return (
    <div className="max-w-6xl mx-auto pt-8 px-4 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Billing</h1>
          <p className="text-gray-500 text-sm">Manage your billing preferences and payment methods.</p>
        </div>
        
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {!isVerified ? (
          /* Full width centered view for initial connection */
          <div className="lg:col-span-12 max-w-2xl mx-auto w-full">
            <section className="animate-in fade-in zoom-in-95 duration-500">
              <StripeConnection onVerificationSuccess={() => setIsVerified(true)} />
            </section>
          </div>
        ) : (
          /* Two-column layout after verification */
          <>
            <div className="lg:col-span-8 order-2 lg:order-1 ">
              <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                <PaymentMethods />
              </section>
            </div>
            
            <div className="lg:col-span-4 order-1 lg:order-2 ">
              <section className="animate-in fade-in slide-in-from-right-4 duration-700">
                  <StripeConnection isMiniView={true} />
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;