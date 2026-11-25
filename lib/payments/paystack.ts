/**
 * Server-only Paystack helpers. The secret key never reaches the browser.
 * Paystack Inline creates the charge; the server verifies the returned
 * reference before any order is marked as paid.
 */

const PAYSTACK_API = "https://api.paystack.co";

// A fresh charge can briefly be unavailable to the verify endpoint.
const VERIFY_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [0, 1_000, 2_500, 4_500];

export type PaystackConfigIssue = "missing" | "mode_mismatch" | "wrong_key_type";

export type PaystackVerificationReason =
  | "not_configured"
  | "mode_mismatch"
  | "wrong_key_type"
  | "invalid_reference"
  | "not_found"
  | "network"
  | "gateway"
  | "invalid_response";

export type PaystackVerification = {
  reference: string;
  status: string;
  amountKobo: number;
  currency: string;
  customerEmail: string | null;
  metadata: Record<string, unknown> | null;
};

export type PaystackVerificationResult = {
  data?: PaystackVerification;
  error?: string;
  reason?: PaystackVerificationReason;
  retryable?: boolean;
};

type PaystackPayload = {
  status?: boolean;
  message?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    customer?: { email?: string | null } | null;
    metadata?: Record<string, unknown> | null;
  };
};

type KeyMode = "test" | "live" | null;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function keyMode(value: string): KeyMode {
  if (value.startsWith("pk_test_") || value.startsWith("sk_test_")) return "test";
  if (value.startsWith("pk_live_") || value.startsWith("sk_live_")) return "live";
  return null;
}

function keyType(value: string) {
  if (value.startsWith("pk_")) return "public";
  if (value.startsWith("sk_")) return "secret";
  return null;
}

export function getPaystackPublicKey() {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() ?? "";
}

export function getPaystackSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
}

/**
 * A live public key with a test secret key (or vice versa) charges the buyer
 * and then fails verification. Disable online payments until the pair matches.
 */
export function getPaystackConfigIssue(): PaystackConfigIssue | null {
  const publicKey = getPaystackPublicKey();
  const secretKey = getPaystackSecretKey();

  if (!publicKey || !secretKey) return "missing";
  if (keyType(publicKey) !== "public" || keyType(secretKey) !== "secret") {
    return "wrong_key_type";
  }

  const publicMode = keyMode(publicKey);
  const secretMode = keyMode(secretKey);
  if (!publicMode || !secretMode || publicMode !== secretMode) {
    return "mode_mismatch";
  }

  return null;
}

export function isPaystackConfigured() {
  return getPaystackConfigIssue() === null;
}

function configError(issue: PaystackConfigIssue): PaystackVerificationResult {
  if (issue === "missing") {
    return {
      error:
        "Online payments are not configured yet. Send a purchase request instead and arrange payment with the seller.",
      reason: "not_configured",
    };
  }
  if (issue === "mode_mismatch") {
    return {
      error:
        "Online payments are misconfigured: the Paystack public and secret keys are from different modes. No payment should be attempted until an admin fixes the keys.",
      reason: "mode_mismatch",
    };
  }
  return {
    error:
      "Online payments are misconfigured: the Paystack public and secret keys are in the wrong fields. No payment should be attempted until an admin fixes the keys.",
    reason: "wrong_key_type",
  };
}

export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackVerificationResult> {
  const issue = getPaystackConfigIssue();
  if (issue) {
    console.error("Paystack configuration issue", { issue });
    return configError(issue);
  }

  const trimmed = reference.trim();
  if (trimmed.length < 4 || trimmed.length > 120) {
    return {
      error: "That payment reference is not valid.",
      reason: "invalid_reference",
    };
  }

  const secretKey = getPaystackSecretKey();
  let lastReason: PaystackVerificationReason = "not_found";

  for (let attempt = 0; attempt < VERIFY_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS.at(-1) ?? 1_000);
    }

    let response: Response;
    try {
      response = await fetch(
        `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(trimmed)}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );
    } catch {
      lastReason = "network";
      continue;
    }

    const payload = (await response.json().catch(() => null)) as PaystackPayload | null;
    const message = payload?.message?.trim() ?? "";
    const normalizedMessage = message.toLowerCase();

    if (!response.ok || !payload?.status || !payload.data) {
      if (normalizedMessage.includes("not found")) {
        lastReason = "not_found";
        continue;
      }

      if (
        response.status === 401 ||
        response.status === 403 ||
        normalizedMessage.includes("invalid key") ||
        normalizedMessage.includes("authorization")
      ) {
        console.error("Paystack rejected the configured secret key", {
          status: response.status,
        });
        return {
          error:
            "Paystack rejected the server payment key. Online payments are temporarily unavailable; contact support with your reference.",
          reason: "gateway",
        };
      }

      console.error("Paystack verification failed", {
        status: response.status,
        message,
      });
      return {
        error:
          "We could not verify that payment with Paystack. Do not pay again if you were charged; contact support with your reference.",
        reason: "gateway",
      };
    }

    const amount = Number(payload.data.amount);
    if (!Number.isFinite(amount)) {
      return {
        error: "Paystack did not return a valid amount for that payment.",
        reason: "invalid_response",
      };
    }

    return {
      data: {
        reference: payload.data.reference ?? trimmed,
        status: payload.data.status ?? "unknown",
        amountKobo: amount,
        currency: (payload.data.currency ?? "").toUpperCase(),
        customerEmail: payload.data.customer?.email ?? null,
        metadata:
          payload.data.metadata && typeof payload.data.metadata === "object"
            ? payload.data.metadata
            : null,
      },
    };
  }

  if (lastReason === "network") {
    return {
      error:
        "We could not reach Paystack to verify that payment. Check your connection and retry confirmation. Do not pay again if you were charged.",
      reason: "network",
      retryable: true,
    };
  }

  return {
    error:
      "Paystack has not confirmed that payment yet. Do not pay again — keep your reference and retry confirmation in a moment.",
    reason: "not_found",
    retryable: true,
  };
}
