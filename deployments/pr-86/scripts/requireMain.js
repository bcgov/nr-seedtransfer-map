require(['scripts/defineMap.js', 'scripts/main.js'], function (defineMap, main) {
  $(function () {
    const seedlotDate = document.body.getAttribute('data-seedlot-date')
    if (seedlotDate) {
      document.querySelectorAll('.seedlot-data-date-placeholder').forEach(function (el) {
        el.textContent = seedlotDate
      })
    }
    main.fillSelects()
    setTimeout(function () {
      defineMap.mapInit()
    }, 0)

    // Fix close button for offcanvas on all devices
    const closeBtn = document.querySelector('.offcanvas-header .btn-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        const offcanvas = document.getElementById('sidebarOffcanvas')
        if (offcanvas) {
          offcanvas.classList.remove('show')
          const backdrop = document.querySelector('.offcanvas-backdrop')
          if (backdrop) {
            backdrop.remove()
          }
        }
      })
    }
  })
  var errorTimeoutId = null
  var selected = []

  // Visual loader state helpers
  function showLoader(message) {
    const loadingText = document.getElementById('loading-text')
    if (loadingText) {
      loadingText.innerText = message || 'Loading database...'
    }
    const loadingOverlay = document.getElementById('loading-overlay')
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex'
    }
    document.querySelectorAll('button, input, select').forEach(function (el) {
      el.disabled = true
    })
  }

  function hideLoader() {
    const loadingOverlay = document.getElementById('loading-overlay')
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none'
    }
    document.querySelectorAll('button, input, select').forEach(function (el) {
      el.disabled = false
    })
  }

  function showError(message) {
    hideLoader()
    const existingBanner = document.querySelector('.alert-error-banner')
    if (existingBanner) {
      existingBanner.remove()
    }
    if (errorTimeoutId) {
      clearTimeout(errorTimeoutId)
    }

    const alertDiv = document.createElement('div')
    alertDiv.className = 'alert alert-danger alert-dismissible fade show alert-error-banner'
    alertDiv.setAttribute('role', 'alert')
    Object.assign(alertDiv.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '10000',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '400px',
    })

    const strong = document.createElement('strong')
    strong.textContent = '⚠️ Error: '
    const span = document.createElement('span')
    span.className = 'alert-message-text'
    span.textContent = message
    const closeBtn = document.createElement('button')
    closeBtn.type = 'button'
    closeBtn.className = 'btn-close'
    closeBtn.setAttribute('data-bs-dismiss', 'alert')
    closeBtn.setAttribute('aria-label', 'Close')

    alertDiv.appendChild(strong)
    alertDiv.appendChild(span)
    alertDiv.appendChild(closeBtn)
    document.body.appendChild(alertDiv)

    errorTimeoutId = setTimeout(() => {
      const banner = document.querySelector('.alert-error-banner')
      if (banner) {
        const bsAlert = bootstrap.Alert.getInstance(banner) || new bootstrap.Alert(banner)
        bsAlert.close()
      }
    }, 8000)
  }

  // Listening to the standard native change event on becInputCutblock
  const becInputCutblock = document.getElementById('becInputCutblock')
  if (becInputCutblock) {
    becInputCutblock.addEventListener('change', function (e) {
      selected = Array.from(e.target.selectedOptions).map(function (opt) {
        return opt.value
      })
    })
  }

  // Update climate legend visibility based on selected years
  function updateClimateLegendsVis() {
    const yearInputCutblock = document.getElementById('yearInputCutblock')
    const yearInputSeedlot = document.getElementById('yearInputSeedlot')
    const climateLegend = document.getElementById('climate-legend')

    if (!climateLegend) return

    // Check if either tab has multiple years selected
    const cutblockYears = Array.from(yearInputCutblock?.selectedOptions || []).length
    const seedlotYears = Array.from(yearInputSeedlot?.selectedOptions || []).length
    const totalYears = Math.max(cutblockYears, seedlotYears)

    // Show legend only when multiple years are selected
    if (totalYears > 1) {
      climateLegend.style.display = 'block'
    } else {
      climateLegend.style.display = 'none'
    }
  }

  // Update time series year when changed (Cutblock tab)
  const yearInputCutblock = document.getElementById('yearInputCutblock')
  const yearInputSeedlot = document.getElementById('yearInputSeedlot')

  if (yearInputCutblock) {
    yearInputCutblock.addEventListener('change', function (e) {
      // Get all selected values from multi-select
      const selectedYears = Array.from(e.target.selectedOptions).map((option) => option.value)
      main.setTimeSeriesYear(selectedYears)
      updateClimateLegendsVis()

      // Sync the Seedlot tab year selector to match
      if (yearInputSeedlot && window.selectYearSeedlot) {
        window.selectYearSeedlot.setSelected(selectedYears)
      }
    })
  }

  // Update time series year when changed (Seedlot tab)
  if (yearInputSeedlot) {
    yearInputSeedlot.addEventListener('change', function (e) {
      // Get all selected values from multi-select
      const selectedYears = Array.from(e.target.selectedOptions).map((option) => option.value)
      main.setTimeSeriesYear(selectedYears)
      updateClimateLegendsVis()

      // Sync the Cutblock tab year selector to match
      if (yearInputCutblock && window.selectYearCutblock) {
        window.selectYearCutblock.setSelected(selectedYears)
      }
    })
  }

  // clicking Go button on "I have a cutblock tab"
  document.getElementById('addButtonCutblock').addEventListener('click', function () {
    showLoader('Calculating suitability map and retrieving seedlot data...')
    defineMap.clearLyrs()
    main
      .addSuitabilityLayerCutblock(document.getElementById('speciesInputCutblock').value, selected)
      .then((layers) => {
        defineMap.updateLayer(layers)
        hideLoader()
        updateClimateLegendsVis()
        $('#mapLegend').fadeIn(300)
      })
      .catch((error) => {
        showError(error.message)
      })
  })

  // Go button "I have a Seedlot" tab
  document.getElementById('addButtonSeedlot').addEventListener('click', function () {
    showLoader('Calculating suitability map and updating seedlot tables...')
    defineMap.clearLyrs()
    main
      .addSuitabilityLayerSeedlot(
        document.getElementById('speciesInputSeedlot').value,
        document.getElementById('becInputSeedlot').value,
      )
      .then((layers) => {
        defineMap.updateLayer(layers)
        hideLoader()
        updateClimateLegendsVis()
        $('#mapLegend').fadeIn(300)
      })
      .catch((error) => {
        showError(error.message)
      })
  })

  document.getElementById('addSeedlotfromOrchard').addEventListener('click', function () {
    showLoader('Searching Orchard database...')
    main
      .populateSeedlot(document.getElementById('orchardNumber').value)
      .then(() => {
        hideLoader()
      })
      .catch((error) => {
        showError(error.message)
      })
  })
  document.getElementById('addSpeciesBecSeedlot').addEventListener('click', function () {
    showLoader('Searching Seedlot database...')
    main
      .populateSpeciesBEC(document.getElementById('seedlotNumber').value)
      .then(() => {
        hideLoader()
      })
      .catch((error) => {
        showError(error.message)
      })
  })

  document.getElementById('clearButtonCutblock').addEventListener('click', function () {
    defineMap.clearCutBlock()
    $('#mapLegend').fadeOut(300)
  })
})
