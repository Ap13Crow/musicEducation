# Base resources

The base must remain environment- and provider-neutral. The bootstrap contains only the namespace so the directory can be validated before any workload is introduced.

Add the proposed resources one concern at a time. Do not place Secret values, provider account identifiers, host-specific storage classes, or mutable image tags in the base.
