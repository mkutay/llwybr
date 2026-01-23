"use client";

import { createContext, useContext, useState } from "react";

interface DialogContextValue<TValue> {
  open: boolean;
  value: TValue | null;
  openDialog: (value: TValue | null) => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
}

export function createDialogContext<TValue>() {
  const Context = createContext<DialogContextValue<TValue> | undefined>(
    undefined,
  );

  function Provider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<TValue | null>(null);

    const openDialog = (newValue: TValue | null) => {
      setValue(newValue);
      setOpen(true);
    };

    const closeDialog = () => {
      setOpen(false);
    };

    return (
      <Context.Provider
        value={{
          open,
          value,
          openDialog,
          closeDialog,
          setOpen,
        }}
      >
        {children}
      </Context.Provider>
    );
  }

  function useDialog() {
    const context = useContext(Context);

    if (context === undefined) {
      throw new Error("useDialog must be used within a DialogProvider");
    }

    return context;
  }

  return {
    Provider,
    useDialog,
  };
}
