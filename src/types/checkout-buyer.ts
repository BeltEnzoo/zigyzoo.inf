/** Datos del comprador para checkout (serializable al servidor). */
export type CheckoutBuyerPayload = {
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
};
