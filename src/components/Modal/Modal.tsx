import { useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useModalContext } from "./context"
import { X } from "lucide-react"

interface Props {
    icon?: ReactNode,
    title: string,
    description?: string,
    children: React.ReactNode,
    disableClickOutside?: boolean,
    onRequestClose?: () => void,
    panelClassName?: string,
}

export const Modal = ({ icon, title, description, children, disableClickOutside, onRequestClose, panelClassName = "max-w-xl" }: Props) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const { isOpen, setIsOpen } = useModalContext();

    const closeModal = () => {
        if (onRequestClose) {
            onRequestClose();
        } else {
            setIsOpen(false);
        }
    }

    const modalRoot = document.getElementById("modal")

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [setIsOpen, isOpen])


    if (!isOpen || !modalRoot) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(7,22,15,0.48)] px-4"
            onClick={() => {
                if (!disableClickOutside) {
                    closeModal();
                }
            }}
        >
            <div
                className={`w-full ${panelClassName} overflow-hidden rounded-3xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-[#152018]/95 shadow-2xl backdrop-blur`}
                onClick={handleContentClick}
                ref={modalRef}
            >

                <div className="bg-white/80 dark:bg-[#1a2b1f]/90 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-[#2a4035]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {icon}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e2f0e8]">{title}</h3>
                        </div>
                        <button
                            onClick={closeModal}
                            className="rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#253d2e] focus:outline-none focus:ring-2 focus:ring-emerald-500 p-2 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {description && <p className="mt-1 text-sm text-gray-500 dark:text-[#7aaa8e]">
                        {description}
                    </p>}

                </div>
                <div className="bg-white/70 dark:bg-[#152018]/80 px-6 py-4 space-y-4 overflow-y-auto max-h-[72vh]">
                    {children}
                </div>
            </div>
        </div>,
        modalRoot
    )
}