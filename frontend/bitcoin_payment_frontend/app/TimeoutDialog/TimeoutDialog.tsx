import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../components/ui/alert-dialog";
import { Link } from "react-router";

interface TimeoutDialogProps {
  open: boolean;
  onCancel: () => void;
  onRetry: () => void;
}

export default function TimeoutDialog({
  open,
  onCancel,
  onRetry,
}: TimeoutDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tiempo de espera agotado!</AlertDialogTitle>
          <AlertDialogDescription>
            Puedes generar un nuevo código QR o dirección de pago.
            <br />
            <span className="text-red-500 font-semibold">
              Recuerda que el tiempo de espera es de 300 segundos.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Link to="/">
            <AlertDialogCancel onClick={onCancel}>
              Cancelar transacción
            </AlertDialogCancel>
          </Link>
          <AlertDialogAction onClick={onRetry}>
            Generar nueva invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
