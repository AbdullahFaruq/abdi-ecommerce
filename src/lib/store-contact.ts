/**
 * There's no payment gateway here — customers pay by bank transfer or EVC
 * Plus (Hormuud's mobile money, the standard way to pay for goods in
 * Somalia) and confirm the order over WhatsApp.
 */
export const BANK_TRANSFER = {
  bankName: "Salaam Bank",
  accountName: "Abdirahman Asad Abdirahman",
  accountNumber: "33751737",
};

export const EVC_PLUS = {
  accountName: "Abdirahman Asad Store",
  number: "+252 615 06 31 26",
};

/** Digits only, country code first, no leading + or 00 — required by wa.me links. */
export const WHATSAPP_NUMBER = "252615063126";
