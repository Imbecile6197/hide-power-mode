#!/usr/bin/env bash
set -euo pipefail
source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "${source_dir}/dist"
gnome-extensions pack --force --extra-source=LICENSE --extra-source=README.md \
    --out-dir="${source_dir}/dist" "${source_dir}"
