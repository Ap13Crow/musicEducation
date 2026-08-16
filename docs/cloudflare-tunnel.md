# Cloudflare Tunnel for development

The development cluster uses a remotely managed Cloudflare Tunnel. A small `cloudflared` Deployment makes outbound connections from Kubernetes to Cloudflare and forwards accepted requests to internal `ClusterIP` Services. The cluster therefore needs no public LoadBalancer, ingress controller, inbound firewall opening, or Caddy deployment.

The initial connector deliberately publishes no application. It can become healthy before Keycloak or the web application exists. Published application routes are added only after their target Services are deployed and healthy.

## Why one development replica

Cloudflare recommends multiple connector replicas for high availability. The current development cluster has one node, so two pods would not provide node-level resilience. This target uses one replica to conserve memory while learning and building. Production should use at least two replicas distributed across at least two nodes; do not add an autoscaler because removing replicas interrupts connections assigned to those replicas.

## 1. Create the named tunnel

In the Cloudflare dashboard:

1. Open **Networking → Tunnels**.
2. Select **Create a tunnel** and choose `cloudflared`.
3. Name the tunnel `mymusiccoach-dev`.
4. Choose **Docker** when Cloudflare presents connector installation options.
5. Copy only the long token from the displayed command. Do not run the Docker command and do not copy the command into GitHub.

The token authorizes anyone holding it to run a connector for this tunnel. Treat it as a password.

## 2. Store the token

In the existing GitHub Environment named `development`, add this environment secret:

```text
CLOUDFLARE_TUNNEL_TOKEN
```

Paste only the tunnel token, normally beginning with `eyJ`. Do not create a repository variable, `.env` entry, committed Kubernetes Secret, or issue comment containing it.

The deployment workflow creates or updates the Kubernetes Secret `cloudflare-tunnel` at runtime. Re-running the deployment also restarts the connector so a rotated token takes effect immediately.

## 3. Deploy the connector

After the tunnel deployment pull request is merged, open **Actions → Development Cloudflare Tunnel → Run workflow** on `main`.

Run `plan` first. It renders the manifests and confirms that they contain no Secret, Ingress, LoadBalancer, or mutable `latest` image.

Then run `deploy`. The workflow:

1. verifies the exact `do-ams3-mymusiccoach-dev` context;
2. synchronizes the tunnel token from the protected GitHub Environment;
3. applies the dedicated ServiceAccount and `cloudflared` Deployment;
4. restarts the Deployment so token rotations take effect; and
5. waits until the `/ready` endpoint confirms an active Cloudflare connection.

The Cloudflare dashboard should then show the `mymusiccoach-dev` tunnel as healthy. This confirms the connector, but no hostname is public yet.

## 4. Add development routes later

Do not change the current `mymusic.coach` apex route during development. Once the corresponding Kubernetes Services exist, add published application routes to the same tunnel, for example:

| Public hostname | Internal service target | When to add it |
| --- | --- | --- |
| `auth-dev.mymusic.coach` | `http://keycloak.mymusic-coach.svc.cluster.local:8080` | After Keycloak is ready |
| `dev.mymusic.coach` | `http://web.mymusic-coach.svc.cluster.local:3000` | After the web Deployment is ready |
| `api-dev.mymusic.coach` | `http://api.mymusic-coach.svc.cluster.local:3001` | Only if the API needs a separate public hostname |

These ports are target contracts for the new workload manifests and should be confirmed when those workloads are implemented. Prefer keeping browser API traffic behind the web hostname when the application architecture permits it.

Before exposing the Keycloak hostname, configure its external hostname and proxy headers for Cloudflare. Protect administrative paths separately; the user-facing OpenID Connect endpoints must remain reachable by students and teachers.

## Operations and security

- The connector accepts no inbound connection from the Internet; it initiates outbound connections to Cloudflare.
- There is intentionally no Kubernetes Service for `cloudflared`. Port `2000` is a pod-local readiness and Prometheus metrics endpoint.
- The container runs as the image's non-root user, has a read-only root filesystem, receives no Kubernetes API token, and has all Linux capabilities dropped.
- The image uses Cloudflare's immutable build tag `1899-3a2b45c2a511`, corresponding to the 2026.7.3 release. Upgrade it through a reviewed manifest change.
- If the tunnel token is exposed, rotate it in Cloudflare, update the GitHub Environment secret, and run `deploy` again.
