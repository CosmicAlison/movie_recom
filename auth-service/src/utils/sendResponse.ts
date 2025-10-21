import { Response } from "express";

export type SendResponseOptions<T> = {
  res: Response;
  statusCode: number;
  data: T;
  message?: string | null;
};

export function sendResponse<T>({ res, statusCode, data, message = null }: SendResponseOptions<T>): void {
  const response = {
    success: statusCode < 400,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}