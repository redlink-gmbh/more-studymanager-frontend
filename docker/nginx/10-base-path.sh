#!/bin/sh
# Rewrite the build-time base-path placeholder to this container's prefix.
#
# The SPA is built with vite `base: '/__BASE_PATH__/'`, so asset URLs, the
# vue-router base (import.meta.env.BASE_URL) and the PWA manifest all carry the
# placeholder and are rewritten together here. One image therefore serves any
# prefix, decided at container start instead of at build time.
#
#   BASE_PATH unset or "/"  -> served at the domain root (the default, and what
#                              the subdomain deployments use)
#   BASE_PATH=/clinician    -> served under /clinician
#
# The reverse proxy is expected to strip the prefix before forwarding, so nginx
# itself keeps serving at "/" - only the URLs the browser sees carry it.
set -eu

prefix="${BASE_PATH:-}"
prefix="${prefix%/}"
if [ -n "$prefix" ]; then
  case "$prefix" in
    /*) ;;
     *) prefix="/$prefix" ;;
  esac
fi

find /usr/share/nginx/html -type f \
  \( -name '*.html' -o -name '*.js' -o -name '*.css' \
     -o -name '*.webmanifest' -o -name '*.json' \) \
  -exec sed -i "s|/__BASE_PATH__|${prefix}|g" {} +

echo "$0: serving under '${prefix:-/}'"
