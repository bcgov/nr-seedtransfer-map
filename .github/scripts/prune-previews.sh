#!/usr/bin/env bash
#
# Remove deployments/pr-<N> preview folders from the gh-pages branch WITHOUT
# downloading the multi-gigabyte FlatGeobuf blobs they contain.
#
# Why: the old cleanup checked out the entire gh-pages branch (now several GB)
# just to delete one folder. That was slow, grew with the branch, and could
# time out — leaving orphaned previews that bloated gh-pages until the GitHub
# Pages build failed. Deleting a folder only needs commit/tree metadata, so a
# blobless (--filter=blob:none) no-checkout clone lets us rebuild the tree and
# push only the deletion in seconds, regardless of branch size.
#
# Usage:  prune-previews.sh <pr-number> [<pr-number> ...]
# Env:    GH_TOKEN  token with contents:write on the repo
#         REPO      owner/name (e.g. bcgov/nr-seedtransfer-map)
#
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <pr-number> [<pr-number> ...]" >&2
  exit 2
fi
: "${GH_TOKEN:?GH_TOKEN is required}"
: "${REPO:?REPO is required}"

# Identity for git commit-tree, supplied via env (no global config mutation).
export GIT_AUTHOR_NAME="github-actions[bot]"
export GIT_AUTHOR_EMAIL="41898282+github-actions[bot]@users.noreply.github.com"
export GIT_COMMITTER_NAME="github-actions[bot]"
export GIT_COMMITTER_EMAIL="41898282+github-actions[bot]@users.noreply.github.com"

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

# Metadata-only clone: trees and commits, but no file blobs.
git clone --filter=blob:none --no-checkout --depth 1 \
  --branch gh-pages --single-branch \
  "https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git" "$workdir"
cd "$workdir"

# Retry loop so a concurrent gh-pages mutation (a deploy) can't make us fail.
for attempt in 1 2 3 4 5; do
  git fetch --filter=blob:none --depth 1 origin gh-pages
  parent="$(git rev-parse FETCH_HEAD)"

  tmp_index="$(mktemp)"
  GIT_INDEX_FILE="$tmp_index" git read-tree "$parent"

  removed=0
  for pr in "$@"; do
    dir="deployments/pr-${pr}"
    if GIT_INDEX_FILE="$tmp_index" git ls-files --error-unmatch "$dir" >/dev/null 2>&1; then
      GIT_INDEX_FILE="$tmp_index" git rm -r --cached --quiet "$dir"
      echo "🧹 staged removal: $dir"
      removed=$((removed + 1))
    fi
  done

  if [ "$removed" -eq 0 ]; then
    rm -f "$tmp_index"
    echo "ℹ️ No matching preview folders on gh-pages — nothing to remove."
    exit 0
  fi

  new_tree="$(GIT_INDEX_FILE="$tmp_index" git write-tree)"
  rm -f "$tmp_index"

  if [ "$removed" -eq 1 ]; then
    msg="chore(deployments): remove preview for closed PR (1 folder)"
  else
    msg="chore(deployments): remove previews for ${removed} closed PRs"
  fi
  new_commit="$(git commit-tree "$new_tree" -p "$parent" -m "$msg")"

  if git push origin "${new_commit}:gh-pages"; then
    echo "✅ Removed ${removed} preview folder(s) from gh-pages."
    exit 0
  fi

  echo "::warning::gh-pages advanced during push; retrying (${attempt}/5)..."
  sleep "$((attempt * 5))"
done

echo "::error::Failed to push gh-pages cleanup after 5 attempts." >&2
exit 1
