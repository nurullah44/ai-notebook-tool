import { notFound } from "next/navigation";
import { IdeaCollectionPrototype } from "./prototype-client";

export default function PrototypePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <IdeaCollectionPrototype />;
}
