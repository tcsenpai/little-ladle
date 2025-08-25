import { useState, useCallback } from 'react';

export type ModalType = 
  | 'addFood' 
  | 'childProfile' 
  | 'autoChef' 
  | 'quickStart' 
  | 'editProfile' 
  | null;

export const useModalManager = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = useCallback((modal: Exclude<ModalType, null>) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const isModalOpen = useCallback((modal: Exclude<ModalType, null>) => {
    return activeModal === modal;
  }, [activeModal]);

  return {
    activeModal,
    openModal,
    closeModal,
    isModalOpen,
    hasActiveModal: activeModal !== null,
  };
};