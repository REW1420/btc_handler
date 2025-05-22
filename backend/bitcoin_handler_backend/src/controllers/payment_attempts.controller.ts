import { Request, Response } from "express";
import { create_new_payment_attempt_service } from "../services/payment_attempt.service";

export const create_lightning_payment_attempt = async (
  req: Request,
  res: Response
) => {
  try {
    const new_order = await create_new_payment_attempt_service(req.body);
    res.status(201).json(new_order);
  } catch (error) {
    console.error("Error al crear orden:", error);
    res
      .status(500)
      .json({ message: "Error al crear la orden con su Payment_request" });
  }
};
