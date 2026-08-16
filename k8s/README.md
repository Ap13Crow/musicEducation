# Legacy Kubernetes manifest

`deployment.yaml` is retained only as a migration reference. Do not apply it to the new cluster: it describes the previous topology and has undocumented ingress, certificate, metrics, storage, and Secret prerequisites.

The provider-neutral Kustomize scaffold for the rebuild lives in `deploy/`.
