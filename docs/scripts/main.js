/* 
 seedlot selector functionality and data
 */

// Load locally vendored FlatGeobuf library for client-side spatial index parsing (RequireJS/AMD loading).
// Vendored locally to prevent CDN dependency failure and satisfy BC Gov Content Security Policies (CSP).
define(['lib/flatgeobuf/flatgeobuf-geojson.min.js'], function (flatgeobuf) {
  var timeSeriesYears = ['2053']

  var speciesStore = [
    { name: 'AT', minsuit: 97.5 },
    { name: 'BA', minsuit: 97.5 },
    { name: 'BG', minsuit: 98.5 },
    { name: 'BL', minsuit: 97.0 },
    { name: 'CW', minsuit: 98.0 },
    { name: 'DR', minsuit: 97.5 },
    { name: 'EP', minsuit: 97.5 },
    { name: 'FDC', minsuit: 97.5 },
    { name: 'FDI', minsuit: 97.5 },
    { name: 'HM', minsuit: 97.5 },
    { name: 'HW', minsuit: 97.5 },
    { name: 'LT', minsuit: 97.5 },
    { name: 'LW', minsuit: 97.5 },
    { name: 'PA', minsuit: 96.5 },
    { name: 'PJ', minsuit: 97.5 },
    { name: 'PLC', minsuit: 97.5 },
    { name: 'PLI', minsuit: 97.5 },
    { name: 'PW', minsuit: 96.0 },
    { name: 'PY', minsuit: 96.0 },
    { name: 'SB', minsuit: 97.5 },
    { name: 'SS', minsuit: 97.0 },
    { name: 'SX', minsuit: 97.5 },
    { name: 'SXS', minsuit: 97.5 },
    { name: 'YC', minsuit: 96.0 },
  ]

  var becStore = [
    { name: 'BAFAun', id: 1 },
    { name: 'BGxh1', id: 2 },
    { name: 'BGxh2', id: 3 },
    { name: 'BGxh3', id: 4 },
    { name: 'BGxw1', id: 5 },
    { name: 'BGxw2', id: 6 },
    { name: 'BWBSdk', id: 7 },
    { name: 'BWBSmk', id: 8 },
    { name: 'BWBSmw', id: 9 },
    { name: 'BWBSvk', id: 10 },
    { name: 'BWBSwk1', id: 11 },
    { name: 'BWBSwk2', id: 12 },
    { name: 'BWBSwk3', id: 13 },
    { name: 'CDFmm', id: 14 },
    { name: 'CMAun', id: 15 },
    { name: 'CMAwh', id: 16 },
    { name: 'CWHdm1', id: 17 },
    { name: 'CWHdm2', id: 18 },
    { name: 'CWHdm3', id: 19 },
    { name: 'CWHds1', id: 20 },
    { name: 'CWHds2', id: 21 },
    { name: 'CWHmm1', id: 22 },
    { name: 'CWHmm2', id: 23 },
    { name: 'CWHms3', id: 24 },
    { name: 'CWHms4', id: 25 },
    { name: 'CWHms5', id: 26 },
    { name: 'CWHvh1', id: 27 },
    { name: 'CWHvh2', id: 28 },
    { name: 'CWHvh3', id: 29 },
    { name: 'CWHvm1', id: 30 },
    { name: 'CWHvm2', id: 31 },
    { name: 'CWHvm3', id: 32 },
    { name: 'CWHvm4', id: 33 },
    { name: 'CWHwh1', id: 34 },
    { name: 'CWHwh2', id: 35 },
    { name: 'CWHwm', id: 36 },
    { name: 'CWHws1', id: 37 },
    { name: 'CWHws2', id: 38 },
    { name: 'CWHws3', id: 39 },
    { name: 'CWHxs', id: 40 },
    { name: 'ESSFdc1', id: 41 },
    { name: 'ESSFdc2', id: 42 },
    { name: 'ESSFdc3', id: 43 },
    { name: 'ESSFdcp', id: 44 },
    { name: 'ESSFdcw', id: 45 },
    { name: 'ESSFdh1', id: 46 },
    { name: 'ESSFdh2', id: 47 },
    { name: 'ESSFdk1', id: 48 },
    { name: 'ESSFdk2', id: 49 },
    { name: 'ESSFdkp', id: 50 },
    { name: 'ESSFdkw', id: 51 },
    { name: 'ESSFdv1', id: 52 },
    { name: 'ESSFdv2', id: 53 },
    { name: 'ESSFdvp', id: 54 },
    { name: 'ESSFdvw', id: 55 },
    { name: 'ESSFmc', id: 56 },
    { name: 'ESSFmcp', id: 57 },
    { name: 'ESSFmcw', id: 58 },
    { name: 'ESSFmh', id: 59 },
    { name: 'ESSFmk', id: 60 },
    { name: 'ESSFmkp', id: 61 },
    { name: 'ESSFmkw', id: 62 },
    { name: 'ESSFmm1', id: 63 },
    { name: 'ESSFmm2', id: 64 },
    { name: 'ESSFmm3', id: 65 },
    { name: 'ESSFmmp', id: 66 },
    { name: 'ESSFmmw', id: 67 },
    { name: 'ESSFmv1', id: 68 },
    { name: 'ESSFmv2', id: 69 },
    { name: 'ESSFmv3', id: 70 },
    { name: 'ESSFmv4', id: 71 },
    { name: 'ESSFmvp', id: 72 },
    { name: 'ESSFmw1', id: 73 },
    { name: 'ESSFmw2', id: 74 },
    { name: 'ESSFmwp', id: 75 },
    { name: 'ESSFmww', id: 76 },
    { name: 'ESSFun', id: 77 },
    { name: 'ESSFun1', id: 78 },
    { name: 'ESSFunp', id: 79 },
    { name: 'ESSFvc', id: 80 },
    { name: 'ESSFvcp', id: 81 },
    { name: 'ESSFvcw', id: 82 },
    { name: 'ESSFwc2', id: 83 },
    { name: 'ESSFwc3', id: 84 },
    { name: 'ESSFwc4', id: 85 },
    { name: 'ESSFwcp', id: 86 },
    { name: 'ESSFwcw', id: 87 },
    { name: 'ESSFwh1', id: 88 },
    { name: 'ESSFwh2', id: 89 },
    { name: 'ESSFwh3', id: 90 },
    { name: 'ESSFwk1', id: 91 },
    { name: 'ESSFwk2', id: 92 },
    { name: 'ESSFwm1', id: 93 },
    { name: 'ESSFwm2', id: 94 },
    { name: 'ESSFwm3', id: 95 },
    { name: 'ESSFwm4', id: 96 },
    { name: 'ESSFwmp', id: 97 },
    { name: 'ESSFwmw', id: 98 },
    { name: 'ESSFwv', id: 99 },
    { name: 'ESSFwvp', id: 100 },
    { name: 'ESSFwvw', id: 101 },
    { name: 'ESSFxc1', id: 102 },
    { name: 'ESSFxc2', id: 103 },
    { name: 'ESSFxc3', id: 104 },
    { name: 'ESSFxcp', id: 105 },
    { name: 'ESSFxcw', id: 106 },
    { name: 'ESSFxv1', id: 107 },
    { name: 'ESSFxv2', id: 108 },
    { name: 'ESSFxvp', id: 109 },
    { name: 'ESSFxvw', id: 110 },
    { name: 'ICHdk', id: 111 },
    { name: 'ICHdm', id: 112 },
    { name: 'ICHdw1', id: 113 },
    { name: 'ICHdw3', id: 114 },
    { name: 'ICHdw4', id: 115 },
    { name: 'ICHmc1', id: 116 },
    { name: 'ICHmc2', id: 117 },
    { name: 'ICHmk1', id: 118 },
    { name: 'ICHmk2', id: 119 },
    { name: 'ICHmk3', id: 120 },
    { name: 'ICHmk4', id: 121 },
    { name: 'ICHmk5', id: 122 },
    { name: 'ICHmm', id: 123 },
    { name: 'ICHmw1', id: 124 },
    { name: 'ICHmw2', id: 125 },
    { name: 'ICHmw3', id: 126 },
    { name: 'ICHmw4', id: 127 },
    { name: 'ICHmw5', id: 128 },
    { name: 'ICHun', id: 129 },
    { name: 'ICHvc', id: 130 },
    { name: 'ICHvk1', id: 131 },
    { name: 'ICHvk2', id: 132 },
    { name: 'ICHwc', id: 133 },
    { name: 'ICHwk1', id: 134 },
    { name: 'ICHwk2', id: 135 },
    { name: 'ICHwk3', id: 136 },
    { name: 'ICHwk4', id: 137 },
    { name: 'ICHxm1', id: 138 },
    { name: 'ICHxw', id: 139 },
    { name: 'ICHxwa', id: 140 },
    { name: 'IDFdc', id: 141 },
    { name: 'IDFdh', id: 142 },
    { name: 'IDFdk1', id: 143 },
    { name: 'IDFdk2', id: 144 },
    { name: 'IDFdk3', id: 145 },
    { name: 'IDFdk4', id: 146 },
    { name: 'IDFdk5', id: 147 },
    { name: 'IDFdm1', id: 148 },
    { name: 'IDFdm2', id: 149 },
    { name: 'IDFdw', id: 150 },
    { name: 'IDFmw2', id: 151 },
    { name: 'IDFww', id: 152 },
    { name: 'IDFxc', id: 153 },
    { name: 'IDFxh1', id: 154 },
    { name: 'IDFxh2', id: 155 },
    { name: 'IDFxk', id: 156 },
    { name: 'IDFxm', id: 157 },
    { name: 'IDFxw', id: 158 },
    { name: 'IDFxx1', id: 159 },
    { name: 'IDFxx2', id: 160 },
    { name: 'IMAun', id: 161 },
    { name: 'MHmm1', id: 162 },
    { name: 'MHmm2', id: 163 },
    { name: 'MHmmp', id: 164 },
    { name: 'MHms', id: 165 },
    { name: 'MHmsp', id: 166 },
    { name: 'MHun', id: 167 },
    { name: 'MHunp', id: 168 },
    { name: 'MHvh', id: 169 },
    { name: 'MHvhp', id: 170 },
    { name: 'MHwh', id: 171 },
    { name: 'MHwhp', id: 172 },
    { name: 'MSdc1', id: 173 },
    { name: 'MSdc2', id: 174 },
    { name: 'MSdc3', id: 175 },
    { name: 'MSdk', id: 176 },
    { name: 'MSdm1', id: 177 },
    { name: 'MSdm2', id: 178 },
    { name: 'MSdm3', id: 179 },
    { name: 'MSdv', id: 180 },
    { name: 'MSdw', id: 181 },
    { name: 'MSun', id: 182 },
    { name: 'MSxk1', id: 183 },
    { name: 'MSxk2', id: 184 },
    { name: 'MSxk3', id: 185 },
    { name: 'MSxv', id: 186 },
    { name: 'PPxh1', id: 187 },
    { name: 'PPxh2', id: 188 },
    { name: 'SBPSdc', id: 189 },
    { name: 'SBPSmc', id: 190 },
    { name: 'SBPSmk', id: 191 },
    { name: 'SBPSxc', id: 192 },
    { name: 'SBSdh1', id: 193 },
    { name: 'SBSdh2', id: 194 },
    { name: 'SBSdk', id: 195 },
    { name: 'SBSdw1', id: 196 },
    { name: 'SBSdw2', id: 197 },
    { name: 'SBSdw3', id: 198 },
    { name: 'SBSmc1', id: 199 },
    { name: 'SBSmc2', id: 200 },
    { name: 'SBSmc3', id: 201 },
    { name: 'SBSmh', id: 202 },
    { name: 'SBSmk1', id: 203 },
    { name: 'SBSmk2', id: 204 },
    { name: 'SBSmm', id: 205 },
    { name: 'SBSmw', id: 206 },
    { name: 'SBSmz', id: 207 },
    { name: 'SBSun', id: 208 },
    { name: 'SBSvk', id: 209 },
    { name: 'SBSvz', id: 210 },
    { name: 'SBSwk1', id: 211 },
    { name: 'SBSwk2', id: 212 },
    { name: 'SBSwk3', id: 213 },
    { name: 'SWBmk', id: 214 },
    { name: 'SWBmks', id: 215 },
    { name: 'SWBun', id: 216 },
    { name: 'SWBuns', id: 217 },
    { name: 'SWBvk', id: 218 },
    { name: 'SWBvks', id: 219 },
    // Legacy/retired variants appended for backward compatibility with Version_7_0 datasets
    { name: 'BAFAunp', id: 220 },
    { name: 'CMAunp', id: 221 },
    { name: 'CWHdm', id: 222 },
    { name: 'CWHms1', id: 223 },
    { name: 'CWHms2', id: 224 },
    { name: 'CWHun', id: 225 },
    { name: 'CWHxm1', id: 226 },
    { name: 'CWHxm2', id: 227 },
    { name: 'ESSFmw', id: 228 },
    { name: 'ESSFwc2w', id: 229 },
    { name: 'ESSFwm', id: 230 },
    { name: 'ICHmc1a', id: 231 },
    { name: 'IDFmw1', id: 232 },
    { name: 'IDFww1', id: 233 },
    { name: 'IDFxh4', id: 234 },
    { name: 'IMAunp', id: 235 },
    { name: 'MHwh1', id: 236 },
    { name: 'MSdk1', id: 237 },
    { name: 'MSdk2', id: 238 },
    { name: 'MSdm3w', id: 239 },
    { name: 'MSmw1', id: 240 },
    { name: 'MSmw2', id: 241 },
    { name: 'MSun', id: 242 },
    { name: 'PPdh2', id: 243 },
    { name: 'PPxh3', id: 244 },
    { name: 'SBSwk3a', id: 245 },
  ]

  // Helper function to build year-based layer data when multiple years are selected
  function buildYearBasedLayers(sp, bec, yearsArray, mode = 'cutblock') {
    // mode: 'cutblock' (BECvar_site) or 'seedlot' (BECvar_seed)
    // Returns: { yearLayers: [{year, suit, nonSuit}, ...] }
    return new Promise((resolve, reject) => {
      let speciesEntry = speciesStore.find((x) => x.name === sp)
      if (!speciesEntry) {
        reject(new Error('Unknown species: ' + sp))
        return
      }
      let suit = speciesEntry.minsuit / 100

      const type = mode === 'seedlot' ? 'seed' : 'site'
      const becField = mode === 'seedlot' ? 'BECvar_seed' : 'BECvar_site'
      const outputField = mode === 'seedlot' ? 'BECvar_site' : 'BECvar_seed'

      const yearPromises = yearsArray.map((year) => {
        let becNames
        if (Array.isArray(bec)) {
          becNames = bec.map((id) => becStore.find((x) => x.id == id).name)
        } else {
          becNames = [becStore.find((x) => x.id == bec).name]
        }

        const becPromises = becNames.map((name) => fetchMigratedHeightList(sp, [year], name, type))

        return Promise.all(becPromises)
          .then((results) => {
            const dataForYear = results.flat()
            return { year, data: dataForYear }
          })
          .catch(() => {
            return { year, data: [] }
          })
      })

      Promise.all(yearPromises)
        .then((results) => {
          const yearLayers = results.map((result) => {
            const { year, data } = result
            const suitList = []
            const nonSuitList = []

            if (Array.isArray(bec) && bec.length > 1) {
              for (let i = 0; i < bec.length; i++) {
                const becEntry = becStore.find((x) => x.id == bec[i])
                if (becEntry) {
                  const becName = becEntry.name
                  data.forEach((item) => {
                    if (item[becField] == becName && item['HTp_pred'] >= suit) {
                      if (item['Sp_suit_site'] == 1) {
                        suitList.push("'" + item[outputField] + "'")
                      } else {
                        nonSuitList.push("'" + item[outputField] + "'")
                      }
                    }
                  })
                }
              }
            } else {
              const becEntry = becStore.find((x) => x.id == bec[0] || x.id == bec)
              if (becEntry) {
                const becName = becEntry.name
                data.forEach((item) => {
                  if (item[becField] == becName && item['HTp_pred'] >= suit) {
                    if (item['Sp_suit_site'] == 1) {
                      suitList.push("'" + item[outputField] + "'")
                    } else {
                      nonSuitList.push("'" + item[outputField] + "'")
                    }
                  }
                })
              }
            }

            return {
              year: year,
              suit: suitList,
              nonSuit: nonSuitList,
            }
          })

          resolve({ yearLayers })
        })
        .catch(reject)
    })
  }

  return {
    fillSelects: fillSelects,
    addSuitabilityLayerCutblock: addSuitabilityLayerCutblock,
    addSuitabilityLayerSeedlot: addSuitabilityLayerSeedlot,
    populateSeedlot: populateSeedlot,
    populateSpeciesBEC: populateSpeciesBEC,
    getIntersection: getIntersection,
    updateData: updateData,
    setTimeSeriesYear: setTimeSeriesYear,
  }

  function setTimeSeriesYear(years) {
    // Accept array of years or single year
    if (Array.isArray(years)) {
      // Filter to only valid years for PL/SX species
      timeSeriesYears = years.filter((y) => ['2043', '2053', '2063'].includes(String(y)))
      // Ensure at least one year is selected
      if (timeSeriesYears.length === 0) {
        timeSeriesYears = ['2053']
      }
    } else if (years) {
      timeSeriesYears = [String(years)]
    } else {
      timeSeriesYears = ['2053']
    }
  }

  /**
   * Fetch migrated height list files with multi-year support.
   * Only PL and SX species have time series variants (2043, 2053, 2063).
   * All other species use the base file (_5.json).
   * When multiple years are selected, combines results from all years.
   */
  function fetchMigratedHeightList(sp, yearsArray, becName, type = 'site') {
    // Determine the base file fallback path using capitalized species code (e.g. Fdi, Plc, Pli, Sx, Sxs)
    const basePrefix = sp.charAt(0).toUpperCase() + sp.slice(1).toLowerCase()
    const fallbackPath = 'Version_7_0/' + basePrefix + '_migrated_height_list_5.json'

    // Determine if the species supports time series variants (2043, 2053, 2063)
    let filePrefix = ''
    let hasTimeSeries = false

    if (sp === 'PLC' || sp === 'PLI') {
      filePrefix = 'Pl'
      hasTimeSeries = true
    } else if (sp === 'SX') {
      filePrefix = 'Sx'
      hasTimeSeries = true
    }

    if (!hasTimeSeries) {
      // Species without time series variants - use base file directly
      return fetchFGB(fallbackPath, becName, type)
    }

    // For species with time series variants, fetch and combine results
    const yearsToFetch = Array.isArray(yearsArray) ? yearsArray : [yearsArray]

    if (yearsToFetch.length === 1) {
      // Single year - use simple fetch with fallback
      const timeSeriesPath =
        'Version_7_0/' + filePrefix + '_migrated_height_list_' + yearsToFetch[0] + '.json'

      return fetchFGB(timeSeriesPath, becName, type).catch(() => {
        return fetchFGB(fallbackPath, becName, type)
      })
    }

    // Multiple years - fetch all and combine
    const fetchPromises = yearsToFetch.map((year) => {
      const timeSeriesPath = 'Version_7_0/' + filePrefix + '_migrated_height_list_' + year + '.json'

      return fetchFGB(timeSeriesPath, becName, type).catch(() => {
        return fetchFGB(fallbackPath, becName, type)
      })
    })

    return Promise.all(fetchPromises).then((results) => {
      // Combine results from all years, removing duplicates based on BECvar_site
      const combined = []
      const seen = new Set()

      results.forEach((yearData) => {
        yearData.forEach((record) => {
          const key = `${record.BECvar_site}|${record.BECvar_seed}`
          if (!seen.has(key)) {
            seen.add(key)
            combined.push(record)
          }
        })
      })

      return combined
    })
  }

  async function fetchFGB(url, becName, type) {
    let fgbUrl = url
    if (url.endsWith('.json')) {
      if (url.includes('_migrated_height_list_')) {
        fgbUrl = url.replace('.json', '_' + type + '.fgb')
      } else {
        fgbUrl = url.replace('.json', '.fgb')
      }
    }

    const idx = becStore.findIndex((b) => b.name === becName)
    if (idx === -1) {
      throw new Error('BEC Variant ' + becName + ' not found in becStore')
    }

    const rect = {
      minX: idx * 10 - 1,
      minY: -1,
      maxX: idx * 10 + 1,
      maxY: 1,
    }

    const isDbPruned = document.body.getAttribute('data-database-pruned') === 'true'
    let targetUrl = fgbUrl
    if (
      isDbPruned &&
      fgbUrl.startsWith('Version_7_0/') &&
      window.location.pathname.includes('/deployments/pr-')
    ) {
      targetUrl = '../../' + fgbUrl
    }

    const features = []
    const iterator = flatgeobuf.deserialize(targetUrl, rect)
    for await (const feature of iterator) {
      features.push(feature.properties)
    }
    return features
  }

  /**
   * Helper utility to retrieve and parse JSON resources.
   * Leverages the native Fetch API to replace old jQuery $.getJSON hooks.
   *
   * Error Handling Strategy:
   * 1. Validates the HTTP status of the response first. If it's not in the 2xx range
   *    (e.g., 404, 500), it explicitly rejects the promise chain with the status text.
   * 2. Safely parses the parsed response body as JSON.
   * 3. Any network failure or invalid JSON parsing will automatically bubble up
   *    as a standard promise rejection to be caught and displayed by the UI error banner.
   */
  function fetchJSON(url) {
    const isDbPruned = document.body.getAttribute('data-database-pruned') === 'true'
    let targetUrl = url
    if (
      isDbPruned &&
      url.startsWith('Version_7_0/') &&
      window.location.pathname.includes('/deployments/pr-')
    ) {
      targetUrl = '../../' + url
    }

    return fetch(targetUrl).then(function (r) {
      if (!r.ok) {
        throw new Error(r.statusText)
      }
      return r.json()
    })
  }

  // adds all the options to the Species and BEC Variant dropdowns
  function fillSelects() {
    for (let i = 0; i < becStore.length; i++) {
      const temp = document.createElement('option')
      temp.label = becStore[i].name
      temp.value = becStore[i].id
      temp.innerHTML = temp.label
      const temp3 = document.createElement('option')
      temp3.label = becStore[i].name
      temp3.value = becStore[i].id
      temp3.innerHTML = temp3.label
      document.getElementById('becInputCutblock').options.add(temp)
      document.getElementById('becInputSeedlot').options.add(temp3)
    }
    for (let j = 0; j < speciesStore.length; j++) {
      const temp2 = document.createElement('option')
      temp2.value = speciesStore[j].name
      temp2.label = speciesStore[j].name
      temp2.innerHTML = temp2.label
      const temp4 = document.createElement('option')
      temp4.value = speciesStore[j].name
      temp4.label = speciesStore[j].name
      temp4.innerHTML = temp4.label
      document.getElementById('speciesInputCutblock').options.add(temp2)
      document.getElementById('speciesInputSeedlot').options.add(temp4)
    }

    if (window.selectSpeciesCutblock) {
      window.selectSpeciesCutblock.destroy()
    }
    window.selectSpeciesCutblock = new SlimSelect({
      select: '#speciesInputCutblock',
    })

    if (window.selectBecCutblock) {
      window.selectBecCutblock.destroy()
    }
    window.selectBecCutblock = new SlimSelect({
      select: '#becInputCutblock',
      settings: {
        maxSelected: 3,
        searchPlaceholder: 'Search BEC Variants...',
      },
    })

    if (window.selectSpeciesSeedlot) {
      window.selectSpeciesSeedlot.destroy()
    }
    window.selectSpeciesSeedlot = new SlimSelect({
      select: '#speciesInputSeedlot',
    })

    if (window.selectBecSeedlot) {
      window.selectBecSeedlot.destroy()
    }
    window.selectBecSeedlot = new SlimSelect({
      select: '#becInputSeedlot',
      settings: {
        maxSelected: 1,
        searchPlaceholder: 'Search BEC Variants...',
      },
    })

    if (window.selectYearCutblock) {
      window.selectYearCutblock.destroy()
    }
    window.selectYearCutblock = new SlimSelect({
      select: '#yearInputCutblock',
      settings: {
        searchEnabled: false,
      },
    })

    if (window.selectYearSeedlot) {
      window.selectYearSeedlot.destroy()
    }
    window.selectYearSeedlot = new SlimSelect({
      select: '#yearInputSeedlot',
      settings: {
        searchEnabled: false,
      },
    })
  }

  // create the paths and locations for the selected cutblock and species
  function addSuitabilityLayerCutblock(sp, bec) {
    if (!sp || sp === '') {
      return Promise.reject(new Error('Please select a Species.'))
    }
    if (
      !bec ||
      bec.length === 0 ||
      bec === '' ||
      (Array.isArray(bec) && (bec.length === 0 || bec[0] === ''))
    ) {
      return Promise.reject(new Error('Please select a BEC Variant.'))
    }

    var outlist_suit, outlist_non_suit
    var output_suit = [],
      output_non_suit = []
    var bec_name

    var jsonseedlot =
      'Version_7_0/' + sp.charAt(0).toUpperCase() + sp.slice(1).toLowerCase() + '_Seedlots.json'
    let speciesEntry = speciesStore.find((x) => x.name === sp)
    if (!speciesEntry) {
      return Promise.reject(new Error('Unknown species: ' + sp))
    }
    let suit = speciesEntry.minsuit / 100

    outlist_suit = []
    outlist_non_suit = []

    let p1 = getSeedLot(bec, suit, 0, jsonseedlot, sp, timeSeriesYears)

    let p2 = new Promise((resolve, reject) => {
      let becNames = []
      if (Array.isArray(bec)) {
        becNames = bec.map((id) => becStore.find((x) => x.id == id).name)
      } else {
        becNames = [becStore.find((x) => x.id == bec).name]
      }

      const becPromises = becNames.map((name) =>
        fetchMigratedHeightList(sp, timeSeriesYears, name, 'site'),
      )

      Promise.all(becPromises)
        .then(function (resultsArray) {
          if (bec.length == 1) {
            var data = resultsArray[0]
            bec_name = becNames[0]
            var results = data.filter(function (x) {
              return x['BECvar_site'] == bec_name && x['HTp_pred'] >= suit
            })
            if (results.length == 0) {
              reject(new Error('No results available for those parameters'))
              return
            }
            output_suit = data.filter(function (x) {
              return x['BECvar_site'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 1
            })
            output_non_suit = data.filter(function (x) {
              return x['BECvar_site'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 0
            })

            updateData(results).then(function (data) {
              populateCutblockTable(data)
            })

            if (output_suit.length > 0) {
              for (let i = 0; i < output_suit.length; i++) {
                outlist_suit.push("'" + output_suit[i].BECvar_seed + "'")
              }
            }
            outlist_suit = outlist_suit.join(', ')

            if (output_non_suit.length > 0) {
              for (let i = 0; i < output_non_suit.length; i++) {
                outlist_non_suit.push("'" + output_non_suit[i].BECvar_seed + "'")
              }
            }
            outlist_non_suit = outlist_non_suit.join(', ')

            resolve(outlist_suit)
          } else {
            let results_intersection_arrays = resultsArray.map((data, i) => {
              const name = becNames[i]
              return data.filter((x) => x['BECvar_site'] == name && x['HTp_pred'] >= suit)
            })

            let output_suit_arrays = resultsArray.map((data, i) => {
              const name = becNames[i]
              return data.filter(
                (x) => x['BECvar_site'] == name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 1,
              )
            })

            let output_non_suit_arrays = resultsArray.map((data, i) => {
              const name = becNames[i]
              return data.filter(
                (x) => x['BECvar_site'] == name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 0,
              )
            })

            let t1 = getIntersection(results_intersection_arrays).then(function (intersection) {
              if (intersection.length == 0) {
                throw new Error('No results available for those parameters')
              }
              return updateData(intersection).then(function (data2) {
                populateCutblockTable(data2)
              })
            })

            let t2 = getIntersection(output_suit_arrays).then(function (output) {
              if (output.length > 0) {
                for (let i = 0; i < output.length; i++) {
                  outlist_suit.push("'" + output[i].BECvar_seed + "'")
                }
              }
              outlist_suit = outlist_suit.join(', ')
            })

            let t3 = getIntersection(output_non_suit_arrays).then(function (output) {
              if (output.length > 0) {
                for (let i = 0; i < output.length; i++) {
                  outlist_non_suit.push("'" + output[i].BECvar_seed + "'")
                }
              }
              outlist_non_suit = outlist_non_suit.join(', ')
            })

            Promise.all([t1, t2, t3])
              .then(() => {
                resolve([outlist_suit, outlist_non_suit])
              })
              .catch(reject)
          }
        })
        .catch(function (errorThrown) {
          if (errorThrown.message === 'No results available for those parameters') {
            reject(errorThrown)
          } else {
            reject(new Error('Failed to load Species database: ' + errorThrown.message))
          }
        })
    })

    return Promise.all([p1, p2]).then((values) => {
      if (timeSeriesYears.length > 1) {
        return buildYearBasedLayers(sp, bec, timeSeriesYears)
      }
      return values[1]
    })
  }

  function getIntersection(array) {
    var intersection = []
    let gettingIntersection = new Promise(function (resolve) {
      if (array.length == 1) {
        intersection = array[0]
      } else if (array.length == 2) {
        // get the intersection of two arrays based on "BECvar_seed"
        intersection = array[0].filter(function (x) {
          return array[1].find(function (y) {
            return x['BECvar_seed'] == y['BECvar_seed']
          })
        })
      } else if (array.length == 3) {
        // get the intersection of three arrays based on "BECvar_seed"
        intersection = array[0].filter(function (x) {
          return (
            array[1].find(function (y) {
              return x['BECvar_seed'] == y['BECvar_seed']
            }) &&
            array[2].find(function (z) {
              return x['BECvar_seed'] == z['BECvar_seed']
            })
          )
        })
      }

      resolve(intersection)
    })

    return gettingIntersection
  }

  function getSeedLot(bec, spmin, min, jsonseedlot, sp, yearsArray) {
    return new Promise((resolve, reject) => {
      const yearsToFetch = Array.isArray(yearsArray) ? yearsArray : [yearsArray]
      const isTimeSeriesSpecies = sp === 'PL' || sp === 'SX'

      const seedlotFiles = isTimeSeriesSpecies
        ? yearsToFetch.map(
            (year) =>
              'Version_7_0/' +
              sp.charAt(0).toUpperCase() +
              sp.slice(1).toLowerCase() +
              '_Seedlots_' +
              year +
              '.json',
          )
        : [jsonseedlot]

      let becNames
      if (Array.isArray(bec)) {
        becNames = bec.map((id) => becStore.find((x) => x.id == id).name)
      } else {
        becNames = [becStore.find((x) => x.id == bec).name]
      }

      const fetchPromises = seedlotFiles.map((file) => {
        const becPromises = becNames.map((name) =>
          fetchFGB(file, name).catch(() => {
            if (file !== jsonseedlot) {
              return fetchFGB(jsonseedlot, name)
            }
            throw new Error('Failed to load Seedlot database')
          }),
        )
        return Promise.all(becPromises).then((results) => results.flat())
      })

      Promise.all(fetchPromises)
        .then((resultsArray) => {
          const data = resultsArray.flat()
          let results
          if (bec.length == 1) {
            const bec_name = becNames[0]
            results = data.filter(function (x) {
              return x['BECvar_site'] == bec_name && parseFloat(x['MigrationDistance']) >= spmin
            })
          } else {
            const filteredByBec = becNames.map((name) =>
              data.filter(function (x) {
                return x['BECvar_site'] == name && parseFloat(x['MigrationDistance']) >= spmin
              }),
            )
            results = getIntersection(filteredByBec)
          }

          Promise.resolve(results).then((finalarray) => {
            for (let i = 0; i < finalarray.length; i++) {
              if (finalarray[i].Seedlot == '') {
                finalarray[i].Seedlot = 0
              }
              if (finalarray[i].GW == '') {
                finalarray[i].GW = 0
              }
            }
            var $table = $('#seedlot_table')
            $table.bootstrapTable('destroy')
            $table.bootstrapTable({ data: finalarray })
            resolve()
          })
        })
        .catch((err) => {
          reject(new Error('Failed to load Seedlot database: ' + err.message))
        })
    })
  }

  function populateSeedlotTable(results) {
    // adding all the data to the bootstrap table
    var $table = $('#seed')
    $table.bootstrapTable('destroy')
    $table.bootstrapTable({ data: results })
  }

  function updateData(data) {
    let new_res = new Promise(function (resolve) {
      let clonedData = data.map((item) => {
        let newItem = { ...item }
        if (newItem.Sp_suit_seed == '1') {
          newItem.Sp_suit_seed = 'Suitable'
        } else {
          newItem.Sp_suit_seed = 'Not Suitable'
        }
        return newItem
      })
      resolve(clonedData)
    })

    return new_res
  }

  function populateCutblockTable(results) {
    // adding all the data to the bootstrap table
    var $table = $('#cutblock_table')
    $table.bootstrapTable('destroy')
    $table.bootstrapTable({ data: results })
  }

  function addSuitabilityLayerSeedlot(sp, bec) {
    if (!sp || sp === '') {
      return Promise.reject(new Error('Please select a Species.'))
    }
    if (!bec || bec === '' || (Array.isArray(bec) && (bec.length === 0 || bec[0] === ''))) {
      return Promise.reject(new Error('Please select a BEC Variant.'))
    }

    var outlist_suit, outlist_non_suit
    var output_suit, output_non_suit

    let speciesEntry = speciesStore.find((x) => x.name === sp)
    if (!speciesEntry) {
      return Promise.reject(new Error('Unknown species: ' + sp))
    }
    let suit = speciesEntry.minsuit / 100

    outlist_suit = []
    outlist_non_suit = []
    return new Promise((resolve, reject) => {
      var becEntryLot = becStore.find((x) => x.id == bec)
      if (!becEntryLot) {
        reject(new Error('Unknown BEC variant ID: ' + bec))
        return
      }
      var bec_name = becEntryLot.name

      fetchMigratedHeightList(sp, timeSeriesYears, bec_name, 'seed')
        .then(function (data) {
          var results = data.filter(function (x) {
            return x['BECvar_seed'] == bec_name && x['HTp_pred'] >= suit
          })

          updateData(results).then(function (data) {
            populateSeedlotTable(data)
          })

          output_suit = data.filter(function (x) {
            return x['BECvar_seed'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 1
          })
          output_non_suit = data.filter(function (x) {
            return x['BECvar_seed'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 0
          })

          if (results.length == 0) {
            throw new Error('No results available for those parameters')
          }

          if (output_suit.length > 0) {
            for (let i = 0; i < output_suit.length; i++) {
              outlist_suit.push("'" + output_suit[i].BECvar_site + "'")
            }
          }
          outlist_suit = outlist_suit.join(', ')

          if (output_non_suit.length > 0) {
            for (let i = 0; i < output_non_suit.length; i++) {
              outlist_non_suit.push("'" + output_non_suit[i].BECvar_site + "'")
            }
          }
          outlist_non_suit = outlist_non_suit.join(', ')

          if (timeSeriesYears.length > 1) {
            buildYearBasedLayers(sp, bec, timeSeriesYears, 'seedlot').then((yearLayers) => {
              resolve(yearLayers)
            })
          } else {
            resolve([outlist_suit, outlist_non_suit])
          }
        })
        .catch(function (errorThrown) {
          if (errorThrown.message === 'No results available for those parameters') {
            reject(errorThrown)
          } else {
            reject(new Error('Failed to load Species database: ' + errorThrown.message))
          }
        })
    })
  }

  function populateSeedlot(orch) {
    var jsonorch = 'Version_7_0/' + 'Orchard_list.json'
    var jsonseed = 'Version_7_0/' + 'Seedlot_list.json'
    var results = []

    return new Promise((resolve, reject) => {
      fetchJSON(jsonorch)
        .then(function (orch_data) {
          var seedlot = orch_data.filter(function (x) {
            return x['Orchard'] == orch || parseFloat(x['Orchard']) == parseFloat(orch)
          })
          if (seedlot.length > 0) {
            document.getElementById('seedlotNumber').value = seedlot[0].Seedlot.toString()

            return fetchJSON(jsonseed)
              .then(function (seed_data) {
                results = seed_data.filter(function (x) {
                  return x['Orchard'] == orch || parseFloat(x['Orchard']) == parseFloat(orch)
                })
                if (results && results.length > 0) {
                  let becVarObj = results[0].BECvar
                    ? becStore.find((x) => x.name == results[0].BECvar)
                    : null
                  if (window.selectBecSeedlot) {
                    if (becVarObj) {
                      window.selectBecSeedlot.setSelected(becVarObj.id.toString())
                    } else {
                      window.selectBecSeedlot.setSelected([])
                    }
                  }

                  if (window.selectSpeciesSeedlot && results[0].Species) {
                    window.selectSpeciesSeedlot.setSelected(results[0].Species)
                  }
                } else {
                  console.warn(`No seedlots found in Seedlot_list.json for Orchard ${orch}`)
                }
                resolve()
              })
              .catch(function (errorThrown) {
                reject(new Error('Failed to load Seedlot database: ' + errorThrown.message))
              })
          } else {
            reject(new Error('Not a valid option'))
          }
        })
        .catch(function (errorThrown) {
          reject(new Error('Failed to load Orchard database: ' + errorThrown.message))
        })
    })
  }

  function populateSpeciesBEC(lot) {
    var jsonseed = 'Version_7_0/' + 'Seedlot_list.json'

    return new Promise((resolve, reject) => {
      fetchJSON(jsonseed)
        .then(function (seed_data) {
          var results = seed_data.filter(function (x) {
            return x['Seedlot'] == lot
          })
          if (results && results.length > 0) {
            let becVarObj = results[0].BECvar
              ? becStore.find((x) => x.name === results[0].BECvar)
              : null
            document.getElementById('orchardNumber').value = results[0].Orchard
              ? parseFloat(results[0].Orchard).toString()
              : ''
            if (window.selectBecSeedlot) {
              if (becVarObj) {
                window.selectBecSeedlot.setSelected(becVarObj.id.toString())
              } else {
                window.selectBecSeedlot.setSelected([])
              }
            }
            if (window.selectSpeciesSeedlot && results[0].Species) {
              window.selectSpeciesSeedlot.setSelected(results[0].Species)
            }
            resolve()
          } else {
            reject(new Error('Not a valid seedlot'))
          }
        })
        .catch(function (errorThrown) {
          reject(new Error('Failed to load Seedlot database: ' + errorThrown.message))
        })
    })
  }
})
