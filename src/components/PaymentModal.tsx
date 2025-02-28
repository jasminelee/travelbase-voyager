import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Wallet, ArrowRight, CreditCard, Shield } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  totalPrice: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, setOpen, totalPrice, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "credit_card">("wallet");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    onPaymentSuccess();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="text-md font-medium leading-none">Total Amount</h4>
            <p className="text-sm text-muted-foreground">
              You are about to pay ${totalPrice} for this experience.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-md font-medium leading-none">Payment Method</h4>
            <p className="text-sm text-muted-foreground">
              Choose your preferred payment method.
            </p>
            <RadioGroup defaultValue="wallet" className="grid grid-cols-2 gap-2" onValueChange={(value) => setPaymentMethod(value as "wallet" | "credit_card")}>
              <div className="flex items-center space-x-2 rounded-md border p-3 shadow-sm transition-all hover:bg-accent hover:text-accent-foreground">
                <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
                <Wallet size={20} className="shrink-0" />
                <Label htmlFor="wallet">
                  Crypto Wallet
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 shadow-sm transition-all hover:bg-accent hover:text-accent-foreground">
                <RadioGroupItem value="credit_card" id="credit_card" className="peer sr-only" />
                <CreditCard size={20} className="shrink-0" />
                <Label htmlFor="credit_card">
                  Credit Card
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <h4 className="text-md font-medium leading-none">Security</h4>
            <p className="text-sm text-muted-foreground">
              Your payment is secured with the latest encryption technology.
            </p>
            <div className="flex items-center space-x-2">
              <Shield size={20} className="shrink-0 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={processing} onClick={handlePayment}>
            {processing ? "Processing..." : "Confirm Payment"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
