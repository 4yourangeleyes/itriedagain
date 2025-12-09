import { useState } from 'react';

export interface CanvasEmailState {
  showSendEmailModal: boolean;
  isSendingEmail: boolean;
  emailMessage: string;
  emailError: string | null;
}

export interface UseCanvasEmailReturn extends CanvasEmailState {
  setShowSendEmailModal: (show: boolean) => void;
  setIsSendingEmail: (sending: boolean) => void;
  setEmailMessage: (message: string) => void;
  setEmailError: (error: string | null) => void;
  resetEmailState: () => void;
  openEmailModal: () => void;
  closeEmailModal: () => void;
}

export const useCanvasEmail = (): UseCanvasEmailReturn => {
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const resetEmailState = () => {
    setShowSendEmailModal(false);
    setIsSendingEmail(false);
    setEmailMessage('');
    setEmailError(null);
  };

  const openEmailModal = () => {
    setShowSendEmailModal(true);
    setEmailError(null);
  };

  const closeEmailModal = () => {
    setShowSendEmailModal(false);
  };

  return {
    showSendEmailModal,
    isSendingEmail,
    emailMessage,
    emailError,
    setShowSendEmailModal,
    setIsSendingEmail,
    setEmailMessage,
    setEmailError,
    resetEmailState,
    openEmailModal,
    closeEmailModal,
  };
};
