import useSettingStore from '@/store/settingStore';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const COOLDOWN_SECONDS = 60;

const useDeleteUser = () => {
  const { isOpen, setIsOpen, step, setStep, reset, otp, setOtp } =
    useSettingStore();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        reset();
        setResendCooldown(0);
        setIsLoading(false);
        setIsVerifying(false);
      }, 100);
    }
  }, [isOpen]);

  const handleRequestCode = async (isResend = false) => {
    if (isResend && resendCooldown > 0) return;

    setIsLoading(true);
    try {
      await axios.post('/api/user/sendOtp');
      toast.success(
        isResend
          ? 'Confirmation code has been resent.'
          : 'A confirmation code has been sent to your email.'
      );
      setResendCooldown(COOLDOWN_SECONDS);
      setTimeout(() => setStep('action'), 1000);
    } catch (error: any) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data
          : 'Failed to send confirmation code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (otp.length !== 6) {
      toast.warning('Please enter the 6-digit code.');
      return;
    }

    setIsVerifying(true);

    try {
      await axios.post('/api/user/verifyOtp', { otp });
      toast.success('Your account has been deactivated.');
      setIsOpen(false);
      signOut();
    } catch (error: any) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data
          : 'Failed to send confirmation code. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    step,
    setStep,
    otp,
    setOtp,
    resendCooldown,
    isLoading,
    isVerifying,
    handleRequestCode,
    handleVerifyAndDelete,
  };
};

export default useDeleteUser;
