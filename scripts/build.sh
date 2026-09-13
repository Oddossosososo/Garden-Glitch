#!/usr/bin/env bash
set -euo pipefail

npm run build
printf '%s\n' 'GardenGlitch build complete.'
