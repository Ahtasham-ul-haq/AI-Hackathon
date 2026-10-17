import { PageLoading } from "@/components/Loading";

export default function Loading() {
  return <PageLoading title="Opening that edition" messages={["Finding the paper for that date…", "Setting the pages…"]} />;
}
