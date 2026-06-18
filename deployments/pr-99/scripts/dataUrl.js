/*
 * Resolve Version_7_0 data URLs for pruned PR preview deployments.
 * Seedlot JSON/FGB files are pruned and loaded from production via ../../.
 * Polygon outlines and bec_bounds.json are kept in the PR folder (pr-open.yml).
 */
define([], function () {
  var PRUNED_LOCAL_PATHS = {
    'Version_7_0/Management_Units.fgb': true,
    'Version_7_0/Suitable_BEC.fgb': true,
    'Version_7_0/Nonsuitable_BEC.fgb': true,
    'Version_7_0/bec_bounds.json': true,
  }

  function resolveDataUrl(url) {
    if (!url.startsWith('Version_7_0/')) return url

    var isDbPruned = document.body.getAttribute('data-database-pruned') === 'true'
    if (
      isDbPruned &&
      window.location.pathname.includes('/deployments/pr-') &&
      !PRUNED_LOCAL_PATHS[url]
    ) {
      return '../../' + url
    }
    return url
  }

  return { resolveDataUrl: resolveDataUrl }
})
