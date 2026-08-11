#!/bin/sh
set -eu

consumer_path=${1:?"Usage: scripts/check-consumer.sh PATH_TO_CONSUMER"}
script_path=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
brand_path=$(dirname -- "$script_path")
check_failed=0

for bundle_file in BRAND_VERSION shared/app-brand.css shared/app-shell.js vendor/pico.min.css vendor/fonts/Jost-wght.ttf; do
  if [ ! -f "$consumer_path/$bundle_file" ]; then
    echo "Missing: $consumer_path/$bundle_file" >&2
    check_failed=1
  elif ! cmp -s "$brand_path/$bundle_file" "$consumer_path/$bundle_file"; then
    echo "Different: $consumer_path/$bundle_file" >&2
    check_failed=1
  fi
done

if [ "$check_failed" -ne 0 ]; then
  exit 1
fi

echo "Consumer matches MarinOS brand bundle $(tr -d '\n' < "$brand_path/BRAND_VERSION")"
