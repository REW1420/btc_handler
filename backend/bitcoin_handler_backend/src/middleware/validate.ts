import { ZodSchema } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const validate = (
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
): RequestHandler => {
  return async (req, res, next) => {
    const result = await schema.safeParseAsync(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        type: e.path.join("."),
        message: e.message,
      }));

      res.status(400).json({
        message: "Datos inválidos",
        errors,
      });
      return;
    }

    req[source] = result.data;
    next();
  };
};
