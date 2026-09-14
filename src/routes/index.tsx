import { createFileRoute } from "@tanstack/react-router";

import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEGIS" },
      {
        name: "description",
        content:
          "Aegis is a facility operations engine — real-time telemetry, anomaly detection, and work-order dispatch for industrial assets.",
      },
      {
        property: "og:title",
        content: "AEGIS",
      },
      {
        property: "og:description",
        content:
          "Real-time telemetry, anomaly detection, and work-order dispatch for industrial assets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
