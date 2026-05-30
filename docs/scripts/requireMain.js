require(['scripts/defineMap.js', 'scripts/main.js'], function (defineMap, main) {
  main.fillSelects()
  defineMap.mapInit()
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

  // clicking Go button on "I have a cutblock tab"
  document.getElementById('addButtonCutblock').addEventListener('click', function () {
    showLoader('Calculating suitability map and retrieving seedlot data...')
    defineMap.clearLyrs()
    main
      .addSuitabilityLayerCutblock(document.getElementById('speciesInputCutblock').value, selected)
      .then((layers) => {
        defineMap.updateLayer(layers)
        hideLoader()
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

  document.getElementById('mapDiv').addEventListener('click', function () {
    defineMap.updatePopup = 'This is a test'
  })

  document.getElementById('clearButtonCutblock').addEventListener('click', function () {
    defineMap.clearCutBlock()
  })

  const toggleBtn = document.getElementById('sidebarToggle')
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const leftCol = document.getElementById('leftCol')
      if (leftCol) {
        leftCol.classList.toggle('show-mobile')
        if (leftCol.classList.contains('show-mobile')) {
          toggleBtn.innerHTML = '✕ Hide Panel'
        } else {
          toggleBtn.innerHTML = '☰ Show Options'
        }
      }
    })
  }
})
