import { createContext, useState, type ReactNode } from "react";

const ModalContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  isOpen: false,
  setIsOpen: () => null
})

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return <ModalContext.Provider value={{ isOpen, setIsOpen }}>{children}</ModalContext.Provider>
}


export {
  ModalProvider,
  ModalContext
}