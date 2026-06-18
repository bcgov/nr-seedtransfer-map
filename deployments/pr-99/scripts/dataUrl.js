/*
 * Resolve Version_7_0 data URLs for pruned PR preview deployments.
 * Pruned seedlot assets load from production via ../../ when previews are pruned.
 * Polygon outlines and bec_bounds.json are kept in the PR folder (pr-open.yml).
 */
define([], function () {
  var PRUNED_LOCAL_PATHS = {
    'Version_7_0/Management_Units.fgb': true,
    'Version_7_0/Suitable_BEC.fgb': true,
    'Version_7_0/Nonsuitable_BEC.fgb': true,
    'Version_7_0/bec_bounds.json': true,
  }

  function isPrPreview() {
    return window.location.pathname.includes('/deployments/pr-')
  }

  function resolveDataUrl(url) {
    if (!url.startsWith('Version_7_0/')) return url

    var isDbPruned = document.body.getAttribute('data-database-pruned') === 'true'
    if (isDbPruned && isPrPreview() && !PRUNED_LOCAL_PATHS[url]) {
      return '../../' + url
    }
    return url
  }

  // PR previews may serve stale HTML (data-database-pruned) while gh-pages already
  // has a full FGB deploy. Try the local path before production ../../ fallback.
  function getDataUrlCandidates(url) {
    var resolved = resolveDataUrl(url)
    if (resolved.startsWith('../../') && isPrPreview()) {
      return [url, resolved]
    }
    return [resolved]
  }

  return { resolveDataUrl: resolveDataUrl, getDataUrlCandidates: getDataUrlCandidates }
})
