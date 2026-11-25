/** Browser-only Paystack Inline loader, shared by checkout and order pages. */

export type PaystackResponse = { reference: string };

export type PaystackHandler = { openIframe: () => void };

export type PaystackSetupOptions = {
  key: string;
  email: string;
  amount: number;
  currency: string;
  channels: string[];
  metadata: Record<string, unknown>;
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
};

export type PaystackPop = {
  setup: (options: PaystackSetupOptions) => PaystackHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

let paystackScriptPromise: Promise<PaystackPop> | null = null;

export function loadPaystack(): Promise<PaystackPop> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack can only load in the browser."));
  }
  if (window.PaystackPop) return Promise.resolve(window.PaystackPop);

  if (!paystackScriptPromise) {
    paystackScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        if (window.PaystackPop) resolve(window.PaystackPop);
        else reject(new Error("Paystack did not initialise."));
      };
      script.onerror = () => {
        paystackScriptPromise = null;
        reject(new Error("Could not load Paystack. Check your connection."));
      };
      document.body.appendChild(script);
    });
  }

  return paystackScriptPromise;
}
