#!/usr/bin/env bash
# Sends one deployment to the shared VPS (see docs/TEMPLATE_CONTRACT.md §5).
#
# Protocol: SSH as `deploy` with a per-client key. The server runs a forced
# command and ignores any client command, so none is sent. The only input is
# a JSON document on stdin:
#   { "image": "ghcr.io/<owner>/<repo>@sha256:<digest>",
#     "env": { MONGODB_URI, MONGODB_DB, SESSION_SECRET, ...only the defined ones },
#     "registryToken": "<GITHUB_TOKEN of the job>" }
# The server's last output line is "DEPLOY_OK" or "DEPLOY_FAILED <reason>".
#
# With DEPLOY_TARGET=preview (AI Developer preview, §5.2) the document is
#   { "target": "preview", "image": "…@sha256:…", "registryToken": "…" }
# with no env at all: the server generates the preview's own database and
# secret, so no production value is needed or sent.
#
# Inputs (environment only; secrets never go to command-line arguments):
#   IMAGE, REGISTRY_TOKEN, DEPLOY_HOST, DEPLOY_SSH_KEY, DEPLOY_KNOWN_HOSTS,
#   MONGODB_URI, MONGODB_DB, SESSION_SECRET (production only),
#   INITIAL_ADMIN_PASSWORD, APP_DISPLAY_NAME, MONDAY_API_TOKEN, ANTHROPIC_API_KEY, WILL_DOO_MODE (optional),
#   DEPLOY_TARGET (production by default, or preview).
set -euo pipefail
umask 077

fail() {
  echo "::error::$1"
  exit 1
}

# Keys forwarded to the app, in this order. Empty or unset values are omitted.
APP_ENV_KEYS="MONGODB_URI MONGODB_DB SESSION_SECRET INITIAL_ADMIN_PASSWORD APP_DISPLAY_NAME MONDAY_API_TOKEN ANTHROPIC_API_KEY WILL_DOO_MODE"

TARGET=${DEPLOY_TARGET:-production}
case "$TARGET" in
  production) REQUIRED="IMAGE REGISTRY_TOKEN DEPLOY_HOST DEPLOY_SSH_KEY DEPLOY_KNOWN_HOSTS MONGODB_URI MONGODB_DB SESSION_SECRET" ;;
  # The preview never receives production values.
  preview) REQUIRED="IMAGE REGISTRY_TOKEN DEPLOY_HOST DEPLOY_SSH_KEY DEPLOY_KNOWN_HOSTS"; APP_ENV_KEYS="" ;;
  *) fail "DEPLOY_TARGET must be production or preview" ;;
esac

for name in $REQUIRED; do
  [ -n "${!name:-}" ] || fail "$name is required"
done

# An immutable reference only (never a mutable tag such as latest).
[[ "$IMAGE" =~ ^ghcr\.io/[a-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || fail "IMAGE must be ghcr.io/<owner>/<repo>@sha256:<digest>"
# A plain host name: nothing that ssh could read as an option or user.
[[ "$DEPLOY_HOST" =~ ^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$ ]] || fail "DEPLOY_HOST must be a plain host name"

# Mask every value (line by line, for multi-line keys) before anything else
# can print it. GitHub already masks secrets; this also covers the job token
# and variables. The runner consumes these command lines without showing them.
mask() {
  local line
  while IFS= read -r line || [ -n "$line" ]; do
    [ -n "$line" ] && echo "::add-mask::$line"
  done <<< "$1"
  return 0
}
for name in REGISTRY_TOKEN DEPLOY_SSH_KEY $APP_ENV_KEYS; do
  if [ -n "${!name:-}" ]; then mask "${!name}"; fi
done

workdir=$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/deploy.XXXXXX")
trap 'rm -rf "$workdir"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$workdir/key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$workdir/known_hosts"
chmod 600 "$workdir/key" "$workdir/known_hosts"

# jq reads the values from its environment ($ENV), not from argv, so they
# never appear in a process list. The document is piped, never printed.
payload() {
  if [ "$TARGET" = preview ]; then
    jq -n '{ target: "preview", image: $ENV.IMAGE, registryToken: $ENV.REGISTRY_TOKEN }'
    return
  fi
  jq -n --arg keys "$APP_ENV_KEYS" '
    {
      image: $ENV.IMAGE,
      env: (
        ($keys | split(" "))
        | map({ key: ., value: ($ENV[.] // "") })
        | map(select(.value != ""))
        | from_entries
      ),
      registryToken: $ENV.REGISTRY_TOKEN
    }'
}

echo "Deploying $IMAGE to $DEPLOY_HOST ($TARGET)"
status=0
payload | ssh -T \
  -i "$workdir/key" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="$workdir/known_hosts" \
  -o ConnectTimeout=20 \
  -o ServerAliveInterval=15 \
  "deploy@$DEPLOY_HOST" > "$workdir/out" 2> "$workdir/err" || status=$?

# The server never prints secrets; values are masked anyway.
sed 's/^/[server] /' "$workdir/out"
sed 's/^/[ssh] /' "$workdir/err" >&2

last=$(grep -v '^[[:space:]]*$' "$workdir/out" | tail -n 1 | tr -d '\r' || true)
case "$last" in
  "DEPLOY_OK")
    if [ "$status" -ne 0 ]; then
      fail "Server reported DEPLOY_OK but ssh exited with status $status"
    fi
    echo "Deployment accepted by the server"
    if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
      echo "Deployed \`$IMAGE\`" >> "$GITHUB_STEP_SUMMARY"
    fi
    ;;
  "DEPLOY_FAILED"*)
    reason=${last#DEPLOY_FAILED}
    reason=${reason# }
    fail "Deployment failed on the server: ${reason:-no reason given}"
    ;;
  *)
    fail "No DEPLOY_OK/DEPLOY_FAILED line from the server (ssh exit status $status)"
    ;;
esac
