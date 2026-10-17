import { PageLoading } from "@/components/Loading";

export default function Loading() {
  return <PageLoading title="Opening your paper" messages={["Fetching today's edition…", "Setting the front page…"]} />;
}
