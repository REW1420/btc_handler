import axios from "axios";
import prisma from "../prisma/client";

interface Vout {
  value: number;
  scriptpubkey_address: string;
}

interface Tx {
  txid: string;
  status: {
    confirmed: boolean;
    block_time?: number;
  };
  vout: Vout[];
}
export const watch_order = async (payment_attempt_code: string) => {
  console.log("Revisando mempool para:", payment_attempt_code);

  // Paso 1: Obtener datos del intento de pago y la dirección
  const object_watched = await prisma.$transaction(async (tx) => {
    const payment_attempt = await tx.payment_attempt.findUnique({
      where: { payment_attempt_code, payment_status_id: 1 },
      select: {
        payment_status_id: true,
        amount_sats: true,
        order_id: true,
        customer_wallet_address_id: true,
        created_at: true,
        payment_attempt_code: true,
      },
    });

    if (!payment_attempt) {
      throw new Error("Payment attempt no encontrado");
    }

    const wallet = await tx.customer_wallet_address.findUnique({
      where: {
        customer_wallet_address_id: payment_attempt.customer_wallet_address_id!,
      },
      select: { address: true },
    });

    if (!wallet?.address) {
      throw new Error("Wallet no encontrada o dirección no definida");
    }

    return { payment_attempt, wallet };
  });

  const wallet_address = object_watched.wallet.address!.trim();
  const amountSats = object_watched.payment_attempt.amount_sats;

  // Validar que amountSats sea un número válido
  if (amountSats === null) {
    console.log(typeof amountSats !== "number");
    console.log("⚠️ Monto inválido o no definido en amount_sats");
    return "keep";
  }

  const requiredAmount = 10; // Convertir a BTC

  // Paso 2: Obtener transacciones de la dirección
  const res = await axios.get<Tx[]>(
    `https://mempool.space/testnet/api/address/${wallet_address}/txs`
  );
  const txs = res.data;

  // Paso 3: Verificar si hay un pago válido
  for (const tx of txs) {
    if (tx.status.confirmed) {
      // Si está confirmada, ignorar esta transacción
      continue;
    }
    console.log(tx.status.confirmed);

    let foundMatch = false;

    for (const vout of tx.vout) {
      if (vout.scriptpubkey_address !== wallet_address) {
        continue;
      }
      console.log(vout.scriptpubkey_address !== wallet_address);
      console.log("vout.scriptpubkey_address", vout.scriptpubkey_address);
      console.log("wallet_address", wallet_address);
      foundMatch = true;

      console.log(foundMatch);

      //const paidAmount = vout.value / 1e8;
      const paidAmount = vout.value;
      console.log(paidAmount);
      console.log(paidAmount >= requiredAmount);
      console.log(paidAmount);
      console.log(requiredAmount);
      if (paidAmount >= requiredAmount) {
        console.log(
          `[OrderWatcher] ✅ Pago detectado en txid ${tx.txid} para orden ${object_watched.payment_attempt.payment_attempt_code}`
        );

        await prisma.order.updateMany({
          where: {
            order_id: object_watched.payment_attempt.order_id!,
            order_status_id: 1, // pending
          },
          data: { order_status_id: 2 }, // processing
        });

        return "remove"; // Pago válido encontrado
      }
    }

    // Si no encontró ni un solo vout válido en esta tx, continúa con la siguiente
    if (!foundMatch) {
      continue;
    }
  }

  // Paso 4: Verificar si ya fue completada en otra ejecución
  const refreshed_attempt = await prisma.payment_attempt.findUnique({
    where: { payment_attempt_code },
    select: { payment_status_id: true },
  });

  if (refreshed_attempt?.payment_status_id === 2) {
    console.log(
      `✅ Orden ${payment_attempt_code} ya fue procesada. Removiendo del pool.`
    );
    return "remove";
  }

  // Si no se encontró ningún pago válido
  console.log("⚠️ Aún no se encuentra un pago válido");
  return "keep";
};
