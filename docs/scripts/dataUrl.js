/*
 * Resolve Version_7_0 data URLs for pruned PR preview deployments.
 * Full deploys set data-full-fgb-deploy on <body> (pr-open.yml FORCE_FULL_FGB_DEPLOY).
 * Pruned deploys set data-database-pruned and fall back to production ../../ for seedlots.
 * Polygon outlines and bec_bounds.json are always kept in the PR folder when pruned.
 */
define([], function () {
  var PRUNED_LOCAL_PATHS = {
    'Version_7_0/Management_Units.fgb': true,
    'Version_7_0/BEC_Variants.fgb': true,
    'Version_7_0/bec_bounds.json': true,
  }

  function isPrPreview() {
    return window.location.pathname.includes('/deployments/pr-')
  }

  function resolveDataUrl(url) {
    if (!url.startsWith('Version_7_0/')) return url

    if (document.body.getAttribute('data-full-fgb-deploy') === 'true') {
      return url
    }

    var isDbPruned = document.body.getAttribute('data-database-pruned') === 'true'
    if (isDbPruned && isPrPreview() && !PRUNED_LOCAL_PATHS[url]) {
      return '../../' + url
    }
    return url
  }

  // Stale CDN may serve old pruned HTML while gh-pages already has a full deploy.
  // On PR previews, always try the local path before any production ../../ fallback.
  function getDataUrlCandidates(url) {
    var resolved = resolveDataUrl(url)
    if (isPrPreview() && resolved.startsWith('../../')) {
      return [url, resolved]
    }
    return [resolved]
  }

  return { resolveDataUrl: resolveDataUrl, getDataUrlCandidates: getDataUrlCandidates }
})
