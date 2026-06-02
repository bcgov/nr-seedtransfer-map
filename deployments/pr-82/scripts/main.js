/* 
 seedlot selector functionality and data
 */

define(function () {
  var jsontxt, jsonseedlot

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

  var _gensuitdata = [
    { gensuit: '1', classA: '1 to 0.98', classB: '1 to 0.985' },
    { gensuit: '2', classA: '0.98 to 0.965', classB: '0.985 to 0.975' },
    { gensuit: '3', classA: '0.965 to 0.955', classB: '0.975 to 0.965' },
  ]

  var becStore = [
    { name: 'BAFAun', id: 1 },
    { name: 'BAFAunp', id: 2 },
    { name: 'BGxh1', id: 3 },
    { name: 'BGxh2', id: 4 },
    { name: 'BGxh3', id: 5 },
    { name: 'BGxw1', id: 6 },
    { name: 'BGxw2', id: 7 },
    { name: 'BWBSdk', id: 8 },
    { name: 'BWBSmk', id: 9 },
    { name: 'BWBSmw', id: 10 },
    { name: 'BWBSvk', id: 11 },
    { name: 'BWBSwk1', id: 12 },
    { name: 'BWBSwk2', id: 13 },
    { name: 'BWBSwk3', id: 14 },
    { name: 'CDFmm', id: 15 },
    { name: 'CMAun', id: 16 },
    { name: 'CMAunp', id: 17 },
    { name: 'CMAwh', id: 18 },
    { name: 'CWHdm', id: 19 },
    { name: 'CWHds1', id: 20 },
    { name: 'CWHds2', id: 21 },
    { name: 'CWHmm1', id: 22 },
    { name: 'CWHmm2', id: 23 },
    { name: 'CWHms1', id: 24 },
    { name: 'CWHms2', id: 25 },
    { name: 'CWHun', id: 26 },
    { name: 'CWHvh1', id: 27 },
    { name: 'CWHvh2', id: 28 },
    { name: 'CWHvh3', id: 29 },
    { name: 'CWHvm1', id: 30 },
    { name: 'CWHvm2', id: 31 },
    { name: 'CWHwh1', id: 32 },
    { name: 'CWHwh2', id: 33 },
    { name: 'CWHwm', id: 34 },
    { name: 'CWHws1', id: 35 },
    { name: 'CWHws2', id: 36 },
    { name: 'CWHxm1', id: 37 },
    { name: 'CWHxm2', id: 38 },
    { name: 'ESSFdc1', id: 39 },
    { name: 'ESSFdc2', id: 40 },
    { name: 'ESSFdc3', id: 41 },
    { name: 'ESSFdcp', id: 42 },
    { name: 'ESSFdcw', id: 43 },
    { name: 'ESSFdk1', id: 44 },
    { name: 'ESSFdk2', id: 45 },
    { name: 'ESSFdkp', id: 46 },
    { name: 'ESSFdkw', id: 47 },
    { name: 'ESSFdv1', id: 48 },
    { name: 'ESSFdv2', id: 49 },
    { name: 'ESSFdvp', id: 50 },
    { name: 'ESSFdvw', id: 51 },
    { name: 'ESSFmc', id: 52 },
    { name: 'ESSFmcp', id: 53 },
    { name: 'ESSFmh', id: 54 },
    { name: 'ESSFmk', id: 55 },
    { name: 'ESSFmkp', id: 56 },
    { name: 'ESSFmm1', id: 57 },
    { name: 'ESSFmm2', id: 58 },
    { name: 'ESSFmm3', id: 59 },
    { name: 'ESSFmmp', id: 60 },
    { name: 'ESSFmmw', id: 61 },
    { name: 'ESSFmv1', id: 62 },
    { name: 'ESSFmv2', id: 63 },
    { name: 'ESSFmv3', id: 64 },
    { name: 'ESSFmv4', id: 65 },
    { name: 'ESSFmvp', id: 66 },
    { name: 'ESSFmw', id: 67 },
    { name: 'ESSFmw1', id: 68 },
    { name: 'ESSFmw2', id: 69 },
    { name: 'ESSFmwp', id: 70 },
    { name: 'ESSFmww', id: 71 },
    { name: 'ESSFun', id: 72 },
    { name: 'ESSFunp', id: 73 },
    { name: 'ESSFvc', id: 74 },
    { name: 'ESSFvcp', id: 75 },
    { name: 'ESSFvcw', id: 76 },
    { name: 'ESSFwc2', id: 77 },
    { name: 'ESSFwc2w', id: 78 },
    { name: 'ESSFwc3', id: 79 },
    { name: 'ESSFwc4', id: 80 },
    { name: 'ESSFwcp', id: 81 },
    { name: 'ESSFwcw', id: 82 },
    { name: 'ESSFwh1', id: 83 },
    { name: 'ESSFwh2', id: 84 },
    { name: 'ESSFwh3', id: 85 },
    { name: 'ESSFwk1', id: 86 },
    { name: 'ESSFwk2', id: 87 },
    { name: 'ESSFwm', id: 88 },
    { name: 'ESSFwm1', id: 89 },
    { name: 'ESSFwm2', id: 90 },
    { name: 'ESSFwm3', id: 91 },
    { name: 'ESSFwm4', id: 92 },
    { name: 'ESSFwmp', id: 93 },
    { name: 'ESSFwmw', id: 94 },
    { name: 'ESSFwv', id: 95 },
    { name: 'ESSFwvp', id: 96 },
    { name: 'ESSFxc1', id: 97 },
    { name: 'ESSFxc2', id: 98 },
    { name: 'ESSFxc3', id: 99 },
    { name: 'ESSFxcp', id: 100 },
    { name: 'ESSFxcw', id: 101 },
    { name: 'ESSFxv1', id: 102 },
    { name: 'ESSFxv2', id: 103 },
    { name: 'ESSFxvp', id: 104 },
    { name: 'ESSFxvw', id: 105 },
    { name: 'ICHdk', id: 106 },
    { name: 'ICHdm', id: 107 },
    { name: 'ICHdw1', id: 108 },
    { name: 'ICHdw3', id: 109 },
    { name: 'ICHdw4', id: 110 },
    { name: 'ICHmc1', id: 111 },
    { name: 'ICHmc1a', id: 112 },
    { name: 'ICHmc2', id: 113 },
    { name: 'ICHmk1', id: 114 },
    { name: 'ICHmk2', id: 115 },
    { name: 'ICHmk3', id: 116 },
    { name: 'ICHmk4', id: 117 },
    { name: 'ICHmk5', id: 118 },
    { name: 'ICHmm', id: 119 },
    { name: 'ICHmw1', id: 120 },
    { name: 'ICHmw2', id: 121 },
    { name: 'ICHmw3', id: 122 },
    { name: 'ICHmw4', id: 123 },
    { name: 'ICHmw5', id: 124 },
    { name: 'ICHvc', id: 125 },
    { name: 'ICHvk1', id: 126 },
    { name: 'ICHvk2', id: 127 },
    { name: 'ICHwc', id: 128 },
    { name: 'ICHwk1', id: 129 },
    { name: 'ICHwk2', id: 130 },
    { name: 'ICHwk3', id: 131 },
    { name: 'ICHwk4', id: 132 },
    { name: 'ICHxw', id: 133 },
    { name: 'ICHxwa', id: 134 },
    { name: 'IDFdc', id: 135 },
    { name: 'IDFdk1', id: 136 },
    { name: 'IDFdk2', id: 137 },
    { name: 'IDFdk3', id: 138 },
    { name: 'IDFdk4', id: 139 },
    { name: 'IDFdk5', id: 140 },
    { name: 'IDFdm1', id: 141 },
    { name: 'IDFdm2', id: 142 },
    { name: 'IDFdw', id: 143 },
    { name: 'IDFmw1', id: 144 },
    { name: 'IDFmw2', id: 145 },
    { name: 'IDFww', id: 146 },
    { name: 'IDFww1', id: 147 },
    { name: 'IDFxc', id: 148 },
    { name: 'IDFxh1', id: 149 },
    { name: 'IDFxh2', id: 150 },
    { name: 'IDFxh4', id: 151 },
    { name: 'IDFxk', id: 152 },
    { name: 'IDFxm', id: 153 },
    { name: 'IDFxw', id: 154 },
    { name: 'IDFxx2', id: 155 },
    { name: 'IMAun', id: 156 },
    { name: 'IMAunp', id: 157 },
    { name: 'MHmm1', id: 158 },
    { name: 'MHmm2', id: 159 },
    { name: 'MHmmp', id: 160 },
    { name: 'MHun', id: 161 },
    { name: 'MHunp', id: 162 },
    { name: 'MHwh', id: 163 },
    { name: 'MHwh1', id: 164 },
    { name: 'MHwhp', id: 165 },
    { name: 'MSdc1', id: 166 },
    { name: 'MSdc2', id: 167 },
    { name: 'MSdc3', id: 168 },
    { name: 'MSdk', id: 169 },
    { name: 'MSdk1', id: 170 },
    { name: 'MSdk2', id: 171 },
    { name: 'MSdm1', id: 172 },
    { name: 'MSdm2', id: 173 },
    { name: 'MSdm3', id: 174 },
    { name: 'MSdm3w', id: 175 },
    { name: 'MSdv', id: 176 },
    { name: 'MSdw', id: 177 },
    { name: 'MSmw1', id: 178 },
    { name: 'MSmw2', id: 179 },
    { name: 'MSun', id: 180 },
    { name: 'MSxk1', id: 181 },
    { name: 'MSxk2', id: 182 },
    { name: 'MSxk3', id: 183 },
    { name: 'MSxv', id: 184 },
    { name: 'PPdh2', id: 185 },
    { name: 'PPxh1', id: 186 },
    { name: 'PPxh2', id: 187 },
    { name: 'PPxh3', id: 188 },
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
    { name: 'SBSun', id: 207 },
    { name: 'SBSvk', id: 208 },
    { name: 'SBSwk1', id: 209 },
    { name: 'SBSwk2', id: 210 },
    { name: 'SBSwk3', id: 211 },
    { name: 'SBSwk3a', id: 212 },
    { name: 'SWBmk', id: 213 },
    { name: 'SWBmks', id: 214 },
    { name: 'SWBun', id: 215 },
    { name: 'SWBuns', id: 216 },
    { name: 'SWBvk', id: 217 },
    { name: 'SWBvks', id: 218 },
  ]

  return {
    fillSelects: fillSelects,
    addSuitabilityLayerCutblock: addSuitabilityLayerCutblock,
    addSuitabilityLayerSeedlot: addSuitabilityLayerSeedlot,
    populateSeedlot: populateSeedlot,
    populateSpeciesBEC: populateSpeciesBEC,
    getIntersection: getIntersection,
    updateData: updateData,
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
        // Fallback for PR Previews: if a local DB fetch fails (e.g. 404 because
        // pr-open.yml pruned docs/Version_7_0/ when the PR didn't touch it),
        // retry against the stable production database at the gh-pages root.
        //
        // Assumes:
        //   1. Previews live exactly two path segments deep: /deployments/pr-N/
        //      so '../../' resolves to the gh-pages site root.
        //   2. Everything under Version_7_0/ is JSON and loaded via fetchJSON().
        //      If you add non-JSON assets there, either widen this fallback or
        //      disable the prune step in .github/workflows/pr-open.yml.
        if (
          targetUrl.startsWith('Version_7_0/') &&
          window.location.pathname.includes('/deployments/pr-')
        ) {
          const fallbackUrl = '../../' + targetUrl
          console.warn(
            `Local database file not found at ${targetUrl}. Falling back to production database: ${fallbackUrl}`,
          )
          return fetch(fallbackUrl).then(function (fallbackR) {
            if (!fallbackR.ok) {
              throw new Error(fallbackR.statusText)
            }
            return fallbackR.json()
          })
        }
        throw new Error(r.statusText)
      }
      return r.json()
    })
  }

  // adds all the options to the Species and BEC Variant dropdowns
  function fillSelects() {
    for (const i in becStore) {
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
    for (const j in speciesStore) {
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
    var spmin
    var outlist_suit, outlist_non_suit, outlist_2019, outlist_non_2019
    var output_suit, output_non_suit
    var bec_name

    jsontxt =
      'Version_7_0/' +
      sp.charAt(0).toUpperCase() +
      sp.slice(1).toLowerCase() +
      '_migrated_height_list_5.json'
    jsonseedlot =
      'Version_7_0/' + sp.charAt(0).toUpperCase() + sp.slice(1).toLowerCase() + '_Seedlots.json'
    let suit = speciesStore.find((x) => x.name === sp).minsuit

    suit = suit / 100
    spmin = 0
    spmin = spmin / 100
    window.dat = becStore

    outlist_suit = []
    outlist_non_suit = []
    outlist_2019 = []
    outlist_non_2019 = []
    output_suit = []
    output_non_suit = []

    let p1 = getSeedLot(bec, suit, 0, jsonseedlot)

    let p2 = new Promise((resolve, reject) => {
      fetchJSON(jsontxt)
        .then(function (data) {
          var results = []

          let becPromise = new Promise((resolveInner) => {
            if (bec.length == 1) {
              bec_name = becStore.find((x) => x.id == bec).name
              results = data.filter(function (x) {
                return (
                  x['BECvar_site'] == bec_name &&
                  x['HTp_pred'] >= suit &&
                  x['Sp_suit_site'] >= spmin
                )
              })
              output_suit = data.filter(function (x) {
                return (
                  x['BECvar_site'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 1
                )
              })
              output_non_suit = data.filter(function (x) {
                return (
                  x['BECvar_site'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 0
                )
              })

              updateData(results).then(function (data) {
                populateCutblockTable(data)
              })

              // ========= SUITABLE OUTPUT ======================
              if (output_suit.length > 0) {
                for (let i = 0; i < output_suit.length; i++) {
                  outlist_suit.push("'" + output_suit[i].BECvar_seed + "'")
                }
              }
              outlist_suit = outlist_suit.join(', ')

              // ========= NON SUITABLE OUTPUT ==========
              if (output_non_suit.length > 0) {
                for (let i = 0; i < output_non_suit.length; i++) {
                  outlist_non_suit.push("'" + output_non_suit[i].BECvar_seed + "'")
                }
              }
              outlist_non_suit = outlist_non_suit.join(', ')

              resolveInner(outlist_suit)
            } else {
              for (let i = 0; i < bec.length; i++) {
                bec_name = becStore.find((x) => x.id == bec[i]).name
                results.push(
                  data.filter(function (x) {
                    return (
                      x['BECvar_site'] == bec_name &&
                      x['HTp_pred'] >= suit &&
                      x['Sp_suit_site'] >= spmin
                    )
                  }),
                )
                output_suit.push(
                  data.filter(function (x) {
                    return (
                      x['BECvar_site'] == bec_name &&
                      x['HTp_pred'] >= suit &&
                      x['Sp_suit_site'] == 1
                    )
                  }),
                )
                output_non_suit.push(
                  data.filter(function (x) {
                    return (
                      x['BECvar_site'] == bec_name &&
                      x['HTp_pred'] >= suit &&
                      x['Sp_suit_site'] == 0
                    )
                  }),
                )
              }

              let t1 = getIntersection(results).then(function (intersection) {
                if (intersection.length == 0) {
                  alert('No results available for those parameters')
                }
                return updateData(intersection).then(function (data2) {
                  populateCutblockTable(data2)
                })
              })

              // ========= SUITABLE OUTPUT ======================

              let t2 = getIntersection(output_suit).then(function (output) {
                if (output.length > 0) {
                  for (let i = 0; i < output.length; i++) {
                    outlist_suit.push("'" + output[i].BECvar_seed + "'")
                  }
                }
                outlist_suit = outlist_suit.join(', ')
              })

              let t3 = getIntersection(output_non_suit).then(function (output) {
                // ========= NON SUITABLE OUTPUT ==========
                if (output.length > 0) {
                  for (let i = 0; i < output.length; i++) {
                    outlist_non_suit.push("'" + output[i].BECvar_seed + "'")
                  }
                }
                outlist_non_suit = outlist_non_suit.join(', ')
              })

              Promise.all([t1, t2, t3]).then(() => {
                resolveInner(results)
              })
            }
          }).then(function () {
            return [[outlist_suit], [outlist_non_suit], [outlist_2019], [outlist_non_2019]]
          })

          resolve(becPromise)
        })
        .catch(function (errorThrown) {
          reject(new Error('Failed to load Species database: ' + errorThrown.message))
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
      fetchJSON(jsonseedlot)
        .then(function (data) {
          var bec_name = ''
          var results = []
          let finalPromise

          if (bec.length == 1) {
            bec_name = becStore.find((x) => x.id == bec).name
            results = data.filter(function (x) {
              return x['BECvar_site'] == bec_name && x['MigrationDistance'] >= spmin
            })
            finalPromise = Promise.resolve(results)
          } else {
            for (let i = 0; i < bec.length; i++) {
              bec_name = becStore.find((x) => x.id == bec[i]).name
              results.push(
                data.filter(function (x) {
                  return x['BECvar_site'] == bec_name && x['MigrationDistance'] >= spmin
                }),
              )
            }
            finalPromise = getIntersection(results)
          }

          finalPromise.then((finalarray) => {
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
        .catch(function (errorThrown) {
          reject(new Error('Failed to load Seedlot database: ' + errorThrown.message))
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
      for (let i = 0; i < data.length; i++) {
        if (data[i].Sp_suit_seed == '1') {
          data[i].Sp_suit_seed = 'Suitable'
        } else {
          data[i].Sp_suit_seed = 'Not Suitable'
        }
      }
      resolve(data)
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
    var spmin
    var outlist_suit, outlist_non_suit, outlist_2019, outlist_non_2019
    var output_suit, output_non_suit

    jsontxt =
      'Version_7_0/' +
      sp.charAt(0).toUpperCase() +
      sp.slice(1).toLowerCase() +
      '_migrated_height_list_5.json'
    jsonseedlot =
      'Version_7_0/' + sp.charAt(0).toUpperCase() + sp.slice(1).toLowerCase() + '_Seedlots.json'
    let suit = speciesStore.find((x) => x.name === sp).minsuit

    suit = suit / 100
    spmin = 0
    spmin = spmin / 100
    window.dat = becStore

    outlist_suit = []
    outlist_non_suit = []
    outlist_2019 = []
    outlist_non_2019 = []
    return new Promise((resolve, reject) => {
      fetchJSON(jsontxt)
        .then(function (data) {
          window.json_obj = data

          // find the name in becStore associated to the bec id chosen
          var bec_name = becStore.find((x) => x.id == bec).name
          var results = data.filter(function (x) {
            return (
              x['BECvar_seed'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] >= spmin
            )
          })

          updateData(results).then(function (data) {
            populateSeedlotTable(data)
          })

          // 1 means the area is suitable and 0 means it is not a suitable area
          output_suit = data.filter(function (x) {
            return x['BECvar_seed'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 1
          })
          output_non_suit = data.filter(function (x) {
            return x['BECvar_seed'] == bec_name && x['HTp_pred'] >= suit && x['Sp_suit_site'] == 0
          })

          if (results.length == 0) {
            alert('No results available for those parameters')
          }

          // ========= SUITABLE OUTPUT ==========
          if (output_suit.length > 0) {
            for (let i = 0; i < output_suit.length; i++) {
              outlist_suit += "'" + output_suit[i].BECvar_site + "'" + ', '
            }
          }
          outlist_suit = outlist_suit.slice(0, -2)

          // ========= NON SUITABLE OUTPUT ==========
          if (output_non_suit.length > 0) {
            for (let i = 0; i < output_non_suit.length; i++) {
              outlist_non_suit += "'" + output_non_suit[i].BECvar_site + "'" + ', '
            }
          }
          outlist_non_suit = outlist_non_suit.slice(0, -2)

          resolve([outlist_suit, outlist_non_suit, outlist_2019, outlist_non_2019])
        })
        .catch(function (errorThrown) {
          reject(new Error('Failed to load Species database: ' + errorThrown.message))
        })
    })
  }

  function populateSeedlot(orch) {
    var jsonorch = 'Version_7_0/' + 'Orchard_list.json'
    var jsonseed = 'Version_7_0/' + 'Seedlot_list.json'
    var results = ''

    return new Promise((resolve, reject) => {
      fetchJSON(jsonorch)
        .then(function (orch_data) {
          var seedlot = orch_data.filter(function (x) {
            return x['Orchard'] == orch || parseFloat(x['Orchard']) == parseFloat(orch)
          })
          if (seedlot.length > 0) {
            document.getElementById('seedlotNumber').value = seedlot[0].Seedlot.toString()

            fetchJSON(jsonseed)
              .then(function (seed_data) {
                new Promise((resolveInner) => {
                  results = seed_data.filter(function (x) {
                    return x['Orchard'] == orch || parseFloat(x['Orchard']) == parseFloat(orch)
                  })
                  resolveInner(results)
                }).then(() => {
                  window.res = results
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
              })
              .catch(function (errorThrown) {
                reject(new Error('Failed to load Seedlot database: ' + errorThrown.message))
              })
          } else {
            alert('Not a valid option')
            resolve()
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
            alert('Not a valid seedlot')
            resolve()
          }
        })
        .catch(function (errorThrown) {
          reject(new Error('Failed to load Seedlot database: ' + errorThrown.message))
        })
    })
  }
})
