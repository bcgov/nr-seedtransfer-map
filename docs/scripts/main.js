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
  return {
    fillSelects: fillSelects,
    addSuitabilityLayerCutblock: addSuitabilityLayerCutblock,
    addSuitabilityLayerSeedlot: addSuitabilityLayerSeedlot,
    populateSeedlot: populateSeedlot,
    populateSpeciesBEC: populateSpeciesBEC,
    getIntersection: getIntersection,
    updateData: updateData,
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

    var jsontxt =
      'Version_7_0/' +
      sp.charAt(0).toUpperCase() +
      sp.slice(1).toLowerCase() +
      '_migrated_height_list_5.json'
    var jsonseedlot =
      'Version_7_0/' + sp.charAt(0).toUpperCase() + sp.slice(1).toLowerCase() + '_Seedlots.json'
    let speciesEntry = speciesStore.find((x) => x.name === sp)
    if (!speciesEntry) {
      return Promise.reject(new Error('Unknown species: ' + sp))
    }
    let suit = speciesEntry.minsuit / 100

    outlist_suit = []
    outlist_non_suit = []

    let p1 = getSeedLot(bec, suit, 0, jsonseedlot)

    let p2 = new Promise((resolve, reject) => {
      let becNames = []
      if (Array.isArray(bec)) {
        becNames = bec.map((id) => becStore.find((x) => x.id == id).name)
      } else {
        becNames = [becStore.find((x) => x.id == bec).name]
      }

      const becPromises = becNames.map((name) => fetchFGB(jsontxt, name, 'site'))

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

  function getSeedLot(bec, spmin, min, jsonseedlot) {
    return new Promise((resolve, reject) => {
      let becNames = []
      if (Array.isArray(bec)) {
        becNames = bec.map((id) => becStore.find((x) => x.id == id).name)
      } else {
        becNames = [becStore.find((x) => x.id == bec).name]
      }

      const becPromises = becNames.map((name) =>
        fetchFGB(jsonseedlot, name).catch(() => {
          throw new Error('Failed to load Seedlot database')
        }),
      )

      Promise.all(becPromises)
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

    var jsontxt =
      'Version_7_0/' +
      sp.charAt(0).toUpperCase() +
      sp.slice(1).toLowerCase() +
      '_migrated_height_list_5.json'
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

      fetchFGB(jsontxt, bec_name, 'seed')
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

          resolve([outlist_suit, outlist_non_suit])
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
