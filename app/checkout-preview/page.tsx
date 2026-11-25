import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPreviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-0 sm:px-6 sm:py-12">
      <Link
        href="/listings"
        className="inline-flex items-center gap-2 rounded-md py-0.5 text-xs text-muted transition-colors hover:text-accent sm:py-2 sm:text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to listing
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:mt-7 sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-1.5 hidden max-w-xl text-sm leading-6 text-muted sm:mt-2 sm:block">
        Review the item, choose how you’ll receive it, then pay securely with
        Paystack or arrange payment with the seller.
      </p>
      <div className="mt-1 sm:mt-8">
        <CheckoutForm
          listingId={26}
          title="University physics textbook, like new"
          imageUrl="https://iywrbvtzkfyhcbsiybke.supabase.co/storage/v1/object/sign/product_images/1fc38fa0-b63b-413c-aa20-cfdf2761bca6/1785430301359.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDQ1NjY5MS1lNjI3LTQ2ZGItYTE4Ni00MzU1ODc2ZWUxY2QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0X2ltYWdlcy8xZmMzOGZhMC1iNjNiLTQxM2MtYWEyMC1jZmRmMjc2MWJjYTYvMTc4NTQzMDMwMTM1OS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg1NDMwMzA0LCJleHAiOjI2NDkzNDM5MDR9.84K8FY-frZ_a0d3ly-nJpoHWBZHmPPpoKAn4xFlkeDU"
          category="textbooks"
          condition="like-new"
          location="Main campus"
          price={8500}
          stock={4}
          sellerName="Ada Okafor"
          sellerId={null}
          sellerAvatarUrl={null}
          storeName="Campus Corner"
          defaultEmail="buyer@example.com"
          publicKey="pk_test_preview"
          paymentsEnabled
          paymentsIssue={null}
          buyerId="preview-buyer"
        />
      </div>
    </div>
  );
}
