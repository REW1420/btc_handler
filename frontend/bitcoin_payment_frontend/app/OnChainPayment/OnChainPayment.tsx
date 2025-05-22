import React, { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import CopyButton from "~/components/buttons/CopyButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

export function OnChainPaymentView(onchainData: any) {
  const [timer, setTimer] = useState(
    onchainData.onchainData.paymentPreference.invoice_life_time
  );
  const [open, setIsOpen] = useState(false);
  const [attempt, setAttempt] = useState(
    onchainData.onchainData.paymentPreference.invoice_max_attemp
  );

  // Simulate a countdown timer
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev: number) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        if (prev === 1) {
          setIsOpen(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  function satsToBtc(sats: number): string {
    return (sats / 100000).toFixed(8);
  }
  const handle_get_total = (sats: number, fee: number) => {
    const total = sats + fee;
    return total;
  };
  const onchain = {
    network: "Bitcoin OnChain",
    usd: "$" + onchainData.onchainData.amount_info.amount_fiat,
    btc: satsToBtc(onchainData.onchainData.paymentAttempt.amount_sats) + " BTC",
    fee: satsToBtc(onchainData.onchainData.paymentAttempt.network_fee) + " BTC",
    total:
      handle_get_total(
        onchainData.onchainData.paymentAttempt.amount_sats,
        onchainData.onchainData.paymentAttempt.network_fee
      ) + " BTC",
    note: "Puede tardar 10 a 60 min en ser confirmado",
    timer: "Expira en " + timer + " segundos",
    attempt: attempt + "/3",
    address: onchainData.onchainData.wallet_address,
    sats: onchainData.onchainData.paymentAttempt.amount_sats + " Sats",
  };

  return (
    <div className="">
      <div className="bg-gray-100 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-20">
          {/* QR and address */}
          <div className="flex-1">
            <h3 className="text-center font-medium mb-2">
              Escanea el QR o copia la dirección
            </h3>
            <img
              src="https://pngimg.com/uploads/qr_code/qr_code_PNG10.png"
              alt="QR"
              className="w-60 h-60 mx-auto my-4"
            />
            <div className="mb-4 ">
              <p className="text-center text-sm text-gray-900 mt-2 whitespace-pre-line">
                {onchain.timer}
              </p>
              <p className="text-center text-sm text-gray-900 mt-2 whitespace-pre-line">
                Intentos {onchain.attempt}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                title={onchain.address}
                readOnly
                value={onchain.address}
                className="w-full max-w-xs px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
              <CopyButton textToCopy={onchain.address} />
            </div>
          </div>

          {/* Transaction details */}
          <div className="flex-1 text-sm space-y-2">
            <h3 className="text-center font-medium mb-2">
              Detalles de la transacción
            </h3>
            <div className="flex justify-between">
              <span>Red</span>
              <span>{onchain.network}</span>
            </div>
            <div className="flex justify-between">
              <span>Total en USD</span>
              <span>{onchain.usd}</span>
            </div>
            <div className="flex justify-between">
              <span>Total en Bitcoin</span>
              <span>{onchain.btc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">Total en Sats</span>
              <span className="text-xs">{onchain.sats}</span>
            </div>
            <div className="flex justify-between">
              <span>Tarifa de red</span>
              <span>{onchain.fee}</span>
            </div>
            <div className="flex justify-between font-semibold  pt-2">
              <span>Total</span>
              <span>{onchain.total}</span>
            </div>
            <hr className="my-4 border-t border-gray-900" />

            <p className="text-center text-xs text-gray-600 mt-2 whitespace-pre-line">
              {onchain.note}
            </p>
          </div>
        </div>
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
              <Link to={"/"}>
                <AlertDialogCancel
                  onClick={() => {
                    setIsOpen(false);
                  }}
                >
                  Cancel transacción
                </AlertDialogCancel>
              </Link>
              <AlertDialogAction
                onClick={() => {
                  setIsOpen(false);
                  setTimer(300);
                }}
              >
                Generar nueva invoice
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Link to="/btc/waiting_payment">
          <Button variant="outline" size="sm" color="green" className="mt-4">
            Empezar verificacion de pago
          </Button>
        </Link>
      </div>
    </div>
  );
}
