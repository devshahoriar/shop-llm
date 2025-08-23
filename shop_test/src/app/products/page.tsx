import { Suspense } from "react";
import Client from "./Client";

export default function ProductsPage() {
  return (
    <Suspense>
      <Client />
    </Suspense>
  );
}
