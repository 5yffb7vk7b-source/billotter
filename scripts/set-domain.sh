#!/usr/bin/env bash
# Flip the site to a custom domain, in one shot.
# Usage: scripts/set-domain.sh otterbill.net
# ONLY run after the domain is registered in an account WE control and DNS is set:
#   4 × A records @ -> 185.199.108.153 / .109. / .110. / .111.153
#   1 × CNAME www -> 5yffb7vk7b-source.github.io
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="${1:?usage: scripts/set-domain.sh <domain>}"
OLD_BASE="https://5yffb7vk7b-source.github.io/otterbill"
NEW_BASE="https://${DOMAIN}"

# CNAME file tells GitHub Pages which domain to serve.
printf '%s' "$DOMAIN" > CNAME

# Rewrite every absolute URL (canonical, OG, sitemap, robots, README, generator).
grep -rl --include='*.html' --include='*.xml' --include='*.txt' --include='*.md' --include='*.mjs' \
  --exclude-dir=.git --exclude-dir=.claude --exclude-dir=.axyvera "$OLD_BASE" . \
  | while read -r f; do sed -i "s#${OLD_BASE}#${NEW_BASE}#g" "$f"; done

echo "Rewritten files:"
git diff --name-only
echo
echo "Next steps:"
echo "  1. Review: git diff"
echo "  2. Commit: git add -A && git commit -m 'Move site to ${DOMAIN}' && git push"
echo "  3. Set Pages domain: gh api repos/5yffb7vk7b-source/otterbill/pages -X PUT -f cname='${DOMAIN}'"
echo "  4. Once GitHub issues the TLS cert (~1h): gh api repos/5yffb7vk7b-source/otterbill/pages -X PUT -F https_enforced=true"
