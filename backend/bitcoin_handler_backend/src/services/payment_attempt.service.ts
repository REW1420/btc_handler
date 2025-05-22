import prisma from "../prisma/client";

interface Create_new_payment_attempt_input {
  payment_method_id?: number;
  order_id?: number;
  network_fee?: number;
  layer_1_address?: string;
  invoice_address?: string;
  amount_sats?: number;
  metadata?: string;
}

export const create_new_payment_attempt_service = async (
  input: Create_new_payment_attempt_input
) => {
  if (!input.order_id) throw new Error("Missing order_id");

  const DEFAULT_PAYMENT_STATUS_ID = 1;
  const EXPIRED_PAYMENT_STATUS_ID = 4;
  const DEFAULT_PAYMENT_PREFERENCE_ID = 1;

  return await prisma.$transaction(async (tx: any) => {
    // Expira el último intento
    const lastPaymentAttempt = await tx.payment_attempt.findFirst({
      where: { order_id: input.order_id },
      orderBy: { created_at: "desc" },
      select: { payment_attempt_id: true },
    });

    if (lastPaymentAttempt) {
      await tx.payment_attempt.update({
        where: { payment_attempt_id: lastPaymentAttempt.payment_attempt_id },
        data: { payment_status_id: EXPIRED_PAYMENT_STATUS_ID },
      });
    }

    // Busca el wallet válido
    const order = await tx.order.findUnique({
      where: { order_id: input.order_id },
      select: {
        Customer: { select: { customer_wallet_address_id: true } },
      },
    });

    const wallet = await tx.customer_wallet_address.findFirst({
      where: {
        customer_wallet_address_id: order?.Customer?.customer_wallet_address_id,
        wallet_address_status_id: 1,
      },
      select: {
        customer_wallet_address_id: true,
        address: true,
      },
    });

    // Obtiene monto y moneda
    const amount_info = await tx.payment_request.findFirst({
      where: { order_id: input.order_id },
      select: {
        amount_fiat: true,
        Currency: {
          select: { name: true, code: true, symbol: true, country: true },
        },
      },
    });

    // Crea el nuevo intento
    const paymentAttempt = await tx.payment_attempt.create({
      data: {
        payment_method_id: input.payment_method_id,
        order_id: input.order_id,
        network_fee: input.network_fee,
        layer_1_address: input.layer_1_address,
        invoice_address: input.invoice_address,
        amount_sats: input.amount_sats,
        metadata: input.metadata,
        customer_wallet_address_id: wallet?.customer_wallet_address_id,
        payment_preference_id: DEFAULT_PAYMENT_PREFERENCE_ID,
        payment_status_id: DEFAULT_PAYMENT_STATUS_ID,
      },
    });

    const paymentPreference = await tx.payment_preference.findUnique({
      where: { payment_preference_id: DEFAULT_PAYMENT_PREFERENCE_ID },
      select: {
        invoice_life_time: true,
        invoice_max_attempt: true,
      },
    });

    return {
      paymentAttempt,
      paymentPreference,
      wallet_address: wallet?.address,
      amount_info,
    };
  });
};
