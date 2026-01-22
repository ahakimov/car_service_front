import { useState, useCallback } from 'react';

type ModalState = {
  isOpen: boolean;
  id: number | null;
};

type ModalsState = {
  details: ModalState;
  filter: { isOpen: boolean };
  delete: ModalState;
  create: { isOpen: boolean };
  history?: ModalState;
  add?: { isOpen: boolean };
  [key: string]: ModalState | { isOpen: boolean } | undefined;
};

export function useModals(initialState?: Partial<ModalsState>) {
  const [modals, setModals] = useState<ModalsState>({
    details: { isOpen: false, id: null },
    filter: { isOpen: false },
    delete: { isOpen: false, id: null },
    create: { isOpen: false },
    ...initialState,
  });

  const openModal = useCallback(
    (modalName: keyof ModalsState, id?: number | null) => {
      setModals((prev) => {
        const modal = prev[modalName];
        if (!modal) {
          return prev;
        }
        if ('id' in modal && id !== undefined) {
          return {
            ...prev,
            [modalName]: { ...modal, isOpen: true, id },
          };
        }
        return {
          ...prev,
          [modalName]: { ...modal, isOpen: true },
        };
      });
    },
    []
  );

  const closeModal = useCallback((modalName: keyof ModalsState) => {
    setModals((prev) => {
      const modal = prev[modalName];
      if (!modal) {
        return prev;
      }
      if ('id' in modal) {
        return {
          ...prev,
          [modalName]: { ...modal, isOpen: false, id: null },
        };
      }
      return {
        ...prev,
        [modalName]: { ...modal, isOpen: false },
      };
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({
      details: { isOpen: false, id: null },
      filter: { isOpen: false },
      delete: { isOpen: false, id: null },
      create: { isOpen: false },
    });
  }, []);

  return {
    modals,
    setModals,
    openModal,
    closeModal,
    closeAllModals,
  };
}
