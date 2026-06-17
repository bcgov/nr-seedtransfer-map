/* 
 seedlot selector functionality and data
 */

// Load locally vendored FlatGeobuf library for client-side spatial index parsing (RequireJS/AMD loading).
// Vendored locally to prevent CDN dependency failure and satisfy BC Gov Content Security Policies (CSP).
define([
  'lib/flatgeobuf/flatgeobuf-geojson.min.js',
  'scripts/speciesStore.js',
  'scripts/becStore.js',
], function (flatgeobuf, speciesStore, becStore) {
  var timeSeriesYears = ['2053']

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
          becNames = bec.map((id) => {
            const entry = becStore.find((x) => x.id == id)
            if (!entry) throw new Error('Unknown BEC variant ID: ' + id)
            return entry.name
          })
        } else {
          const entry = becStore.find((x) => x.id == bec)
          if (!entry) throw new Error('Unknown BEC variant ID: ' + bec)
          becNames = [entry.name]
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
    targetUrl += '?v=7.0.8'

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
    targetUrl += '?v=7.0.8'

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
        becNames = bec.map((id) => {
          const entry = becStore.find((x) => x.id == id)
          if (!entry) throw new Error('Unknown BEC variant ID: ' + id)
          return entry.name
        })
      } else {
        const entry = becStore.find((x) => x.id == bec)
        if (!entry) throw new Error('Unknown BEC variant ID: ' + bec)
        becNames = [entry.name]
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

            resolve([outlist_suit, outlist_non_suit])
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
        becNames = bec.map((id) => {
          const entry = becStore.find((x) => x.id == id)
          if (!entry) throw new Error('Unknown BEC variant ID: ' + id)
          return entry.name
        })
      } else {
        const entry = becStore.find((x) => x.id == bec)
        if (!entry) throw new Error('Unknown BEC variant ID: ' + bec)
        becNames = [entry.name]
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
