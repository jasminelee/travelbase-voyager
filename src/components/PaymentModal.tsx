
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, X, Check, Loader, ArrowLeft } from 'lucide-react';
import { BookingDetails, PaymentDetails } from '../utils/types';
import { processPayment, generatePaymentQRCode } from '../utils/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: BookingDetails | null;
}

const PaymentModal = ({ isOpen, onClose, bookingDetails }: PaymentModalProps) => {
  const [step, setStep] = useState<'select' | 'coinbase' | 'manual' | 'processing' | 'complete'>('select');
  const [paymentData, setPaymentData] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  if (!isOpen || !bookingDetails) return null;
  
  const handleCoinbasePayment = async () => {
    setStep('coinbase');
    // In a real implementation, this would redirect to Coinbase Onramp
    // For this MVP, we'll simulate the payment process
    setTimeout(() => {
      handlePaymentProcess();
    }, 1500);
  };
  
  const handleManualPayment = () => {
    setStep('manual');
  };
  
  const handlePaymentProcess = async () => {
    setStep('processing');
    setLoading(true);
    
    try {
      // Process payment (mock function)
      const paymentResult = await processPayment(bookingDetails);
      setPaymentData(paymentResult);
      setLoading(false);
      setStep('complete');
    } catch (error) {
      console.error('Payment processing error:', error);
      setLoading(false);
      // Handle error state
    }
  };
  
  const handleGoToSuccess = () => {
    onClose();
    // Navigate to success page with payment data
    navigate('/success', { 
      state: { 
        bookingDetails,
        paymentData
      } 
    });
  };
  
  const handleBack = () => {
    if (step === 'coinbase' || step === 'manual') {
      setStep('select');
    }
  };
  
  const renderModalContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="animate-scale-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Payment Method</h3>
            
            <button 
              onClick={handleCoinbasePayment}
              className="w-full mb-4 flex items-center justify-between px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <img 
                    src="https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg" 
                    alt="Coinbase" 
                    className="h-6"
                  />
                </div>
                <div className="text-left">
                  <span className="font-medium">Pay with Coinbase</span>
                  <p className="text-xs text-white/80">Quick and secure crypto payments</p>
                </div>
              </div>
              <ArrowRight size={20} />
            </button>
            
            <button 
              onClick={handleManualPayment}
              className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 p-2 rounded-lg mr-4">
                  <Wallet size={24} className="text-gray-700" />
                </div>
                <div className="text-left">
                  <span className="font-medium text-gray-900">Manual Wallet Transfer</span>
                  <p className="text-xs text-gray-500">Transfer directly to host wallet</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400" />
            </button>
          </div>
        );
        
      case 'coinbase':
        return (
          <div className="animate-scale-up">
            <button 
              onClick={handleBack}
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coinbase Payment</h3>
            <p className="text-gray-600 mb-6">Complete your payment with Coinbase</p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">{bookingDetails.totalPrice} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-medium text-gray-900 max-w-[200px] truncate text-right">{bookingDetails.experienceId}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl mb-6">
              <img 
                src="https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg" 
                alt="Coinbase" 
                className="h-10 mb-4"
              />
              <p className="text-center text-gray-600 mb-2">
                You'll be redirected to Coinbase to complete your payment securely.
              </p>
              <div className="animate-pulse">
                <Loader size={24} className="text-primary animate-spin" />
              </div>
            </div>
          </div>
        );
        
      case 'manual':
        return (
          <div className="animate-scale-up">
            <button 
              onClick={handleBack}
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back
            </button>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Manual Wallet Transfer</h3>
            <p className="text-gray-600 mb-6">Send cryptocurrency directly to the host's wallet</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">{bookingDetails.totalPrice} USDC</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Network</span>
                <span className="font-medium text-gray-900">Ethereum</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg p-3">
                  <code className="text-xs text-gray-800 flex-1 break-all">0x742d35Cc6634C0532925a3b844Bc454e4438f44e</code>
                  <button className="ml-2 text-primary hover:text-primary/80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-6">
              <p className="text-sm text-gray-600 mb-4">Scan this QR code with your wallet app:</p>
              <img 
                src={generatePaymentQRCode('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', bookingDetails.totalPrice)}
                alt="Payment QR Code" 
                className="w-48 h-48 border border-gray-200 rounded-xl p-2"
              />
            </div>
            
            <button 
              onClick={handlePaymentProcess}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              I've Completed the Transfer
            </button>
          </div>
        );
        
      case 'processing':
        return (
          <div className="animate-scale-up flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              {loading ? (
                <Loader size={32} className="text-primary animate-spin" />
              ) : (
                <Check size={32} className="text-primary" />
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {loading ? 'Processing Payment' : 'Payment Successful'}
            </h3>
            
            <p className="text-gray-600 mb-8 text-center">
              {loading 
                ? 'Please wait while we confirm your transaction...' 
                : 'Your booking has been confirmed!'}
            </p>
            
            {loading && (
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-primary h-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            )}
          </div>
        );
        
      case 'complete':
        return (
          <div className="animate-scale-up flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check size={32} className="text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Payment Successful!</h3>
            <p className="text-gray-600 mb-8 text-center">Your booking has been confirmed.</p>
            
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium text-gray-900">{paymentData?.transactionHash?.substring(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">{paymentData?.amount} {paymentData?.currency}</span>
              </div>
            </div>
            
            <button 
              onClick={handleGoToSuccess}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              View Booking Details
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        
        <div className="p-6">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
