import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/ui/alert-dialog';

const UsuarioDeleteModal = ({ isOpen, onClose, onConfirm, isSubmitting, user }) => (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente al usuario: <strong>{user?.name}</strong>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Al eliminar este usuario, perderá acceso al sistema y todos sus datos asociados serán afectados.
                </AlertDescription>
            </Alert>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} disabled={isSubmitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isSubmitting ? 'Eliminando...' : 'Eliminar Usuario'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

export default UsuarioDeleteModal;
