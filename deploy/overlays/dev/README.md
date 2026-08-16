# Development overlay

Use this overlay for low-cost learning and integration environments. The root overlay remains the namespace-only foundation. Persistent workloads use explicit sub-overlays such as `deploy/overlays/dev/keycloak` so each deployment increment stays reviewable. Future patches should keep replicas and resource requests conservative and must not contain credentials or provider-specific secrets.
