import { useEffect, useRef, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { useModalContext } from "./context"
import { X } from "lucide-react"

interface Props {
    icon?: ReactNode,
    title: string,
    description?: string,
    children: React.ReactNode,
    disableClickOutside?: boolean
}

export const Modal = ({ icon, title, description, children, disableClickOutside }: Props) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const { isOpen, setIsOpen } = useModalContext();

    const closeModal = () => { setIsOpen(false) }

    const modalRoot = document.getElementById("modal")

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false)
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
                className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur"
                onClick={handleContentClick}
                ref={modalRef}
            >

                <div className="bg-white/80 px-6 pt-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {icon}
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 p-2 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {description && <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>}

                </div>
                <div className="bg-white/70 px-6 py-4 space-y-4 overflow-y-auto max-h-[72vh]">
                    {children}
                </div>
            </div>
        </div>,
        modalRoot
    )
}