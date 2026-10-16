import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

function roleGovernancePlugin() {
  return {
    name: "role-governance-dev-middleware",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);

        if (req.method === "POST" && url.pathname === "/api/roles/request-access") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const data = JSON.parse(body || "{}");
              const email = String(data.email || "").trim().toLowerCase();
              if (!email) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Missing user email" }));
                return;
              }

              const role = String(data.role || data.requested_role || "technician").trim();
              const facility_id = String(data.facility_id || "FACILITY-01").trim();
              const name = String(data.name || email.split("@")[0]).trim();
              const now = new Date().toISOString();

              const reqPath = path.resolve(server.config.root, "public", "role_requests.json");
              let cache: Record<string, any> = {};
              if (fs.existsSync(reqPath)) {
                try {
                  cache = JSON.parse(fs.readFileSync(reqPath, "utf-8"));
                } catch {}
              }

              const reqObj = {
                id: Date.now(),
                email,
                name,
                requested_role: role,
                facility_id,
                status: "pending",
                created_at: now,
              };
              cache[email] = reqObj;
              fs.writeFileSync(reqPath, JSON.stringify(cache, null, 2), "utf-8");

              // Also try to forward to Flask on port 5000 if it is running
              try {
                fetch("http://127.0.0.1:5000/api/roles/request-access", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                  signal: AbortSignal.timeout(1000),
                }).catch(() => {});
              } catch {}

              res.statusCode = 201;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  status: "pending",
                  message: `Access request for '${role}' submitted. Awaiting administrator verification in the backend.`,
                  request_id: reqObj.id,
                  email,
                  requested_role: role,
                  request: reqObj,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (req.method === "POST" && url.pathname === "/api/roles/approve-request") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const data = JSON.parse(body || "{}");
              const email = String(data.email || "").trim().toLowerCase();
              const action = String(data.action || "reject").trim().toLowerCase();
              const reqPath = path.resolve(server.config.root, "public", "role_requests.json");
              if (fs.existsSync(reqPath)) {
                try {
                  const cache = JSON.parse(fs.readFileSync(reqPath, "utf-8"));
                  if (cache[email]) {
                    cache[email].status = action === "approve" ? "approved" : "rejected";
                    cache[email].reviewed_at = new Date().toISOString();
                    fs.writeFileSync(reqPath, JSON.stringify(cache, null, 2), "utf-8");
                  }
                } catch {}
              }

              // Also forward to Flask if up
              try {
                fetch("http://127.0.0.1:5000/api/roles/approve-request", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                  signal: AbortSignal.timeout(1000),
                }).catch(() => {});
              } catch {}

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, action }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || "./",
  plugins: [react(), tailwindcss(), roleGovernancePlugin()],
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
