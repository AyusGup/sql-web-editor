import { Response } from "express";

/**
 * Sends a standardized JSON response to the client.
 * @param {Response} res Express Response Object
 * @param {boolean} success Operation success or not
 * @param {number} statusCode HTTP status code
 * @param {string} message Optional message to send
 * @param {object} data Optional data to send
 * @param {string} error Optional error string
 * @returns Express Response with a JSON body
 */
export const responseHandler = (
  res: Response,
  success: boolean,
  statusCode: number,
  message?: string,
  data?: any,
  error?: any
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error,
  });
};
