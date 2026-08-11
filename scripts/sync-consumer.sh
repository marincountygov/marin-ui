#!/bin/sh
set -eu

consumer_path=${1:?"Usage: scripts/sync-consumer.sh PATH_TO_CONSUMER"}
script_path=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
brand_path=$(dirname -- "$script_path")

if [ ! -d "$consumer_path/.git" ]; then
  echo "Not a Git consumer repository: $consumer_path" >&2
  exit 1
fi

mkdir -p "$consumer_path/shared" "$consumer_path/vendor/fonts"
cp "$brand_path/BRAND_VERSION" "$consumer_path/BRAND_VERSION"
cp "$brand_path/shared/app-brand.css" "$consumer_path/shared/app-brand.css"
cp "$brand_path/shared/app-shell.js" "$consumer_path/shared/app-shell.js"
cp "$brand_path/vendor/pico.min.css" "$consumer_path/vendor/pico.min.css"
cp "$brand_path/vendor/fonts/Jost-wght.ttf" "$consumer_path/vendor/fonts/Jost-wght.ttf"

echo "Synced MarinOS brand bundle $(tr -d '\n' < "$brand_path/BRAND_VERSION") to $consumer_path"
