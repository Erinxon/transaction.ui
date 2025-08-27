import { AlertTriangle } from "lucide-react"
import { useModalContext } from "./Modal/context"
import { Modal } from "./Modal/Modal"

interface ConfirmDialogProps {
    title?: string
    description?: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
}

export const ConfirmDialog = ({
    title = "¿Estás seguro?",
    description = "Esta acción no se puede deshacer.",
    onConfirm,
    confirmText = "Confirmar",
    cancelText = "Cancelar"
}: ConfirmDialogProps) => {
    const { setIsOpen } = useModalContext()

    const handleCancel = () => {
        setIsOpen(false)
    }

    const handleConfirm = () => {
        onConfirm()
        setIsOpen(false)
    }

    return (
        <Modal
            icon={<AlertTriangle className="text-yellow-500 w-5 h-5 mr-2" />}
            title={title}
            description={description}
            disableClickOutside={true}
        >
            <div className="flex justify-end space-x-3">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md cursor-pointer"
                >
                    {cancelText}
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer"
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    )
}
