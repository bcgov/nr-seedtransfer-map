require(['scripts/defineMap.js', 'scripts/main.js'], function (defineMap, main) {
  main.fillSelects()
  defineMap.mapInit()
  var errorTimeoutId = null
  var selected = []

  // Visual loader state helpers
  function showLoader(message) {
    $('#loading-text').text(message || 'Loading database...')
    $('#loading-overlay').css('display', 'flex')
    $('button, input, select').prop('disabled', true)
    if ($('select').length > 0 && typeof $.fn.selectpicker === 'function') {
      $('select').selectpicker('refresh')
    }
  }

  function hideLoader() {
    $('#loading-overlay').hide()
    $('button, input, select').prop('disabled', false)
    if ($('select').length > 0 && typeof $.fn.selectpicker === 'function') {
      $('select').selectpicker('refresh')
    }
  }

  function showError(message) {
    hideLoader()
    $('.alert-error-banner').remove()
    if (errorTimeoutId) {
      clearTimeout(errorTimeoutId)
    }

    const $alert = $('<div>')
      .addClass('alert alert-danger alert-dismissible fade show alert-error-banner')
      .attr('role', 'alert')
      .css({
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '400px',
      })

    const $strong = $('<strong>').text('⚠️ Error: ')
    const $msgSpan = $('<span>').addClass('alert-message-text').text(message)
    const $closeBtn = $('<button>')
      .attr({
        type: 'button',
        class: 'close',
        'data-dismiss': 'alert',
        'aria-label': 'Close',
      })
      .html('<span aria-hidden="true">&times;</span>')

    $alert.append($strong).append($msgSpan).append($closeBtn)
    $('body').append($alert)

    errorTimeoutId = setTimeout(() => {
      $('.alert-error-banner').alert('close')
    }, 8000)
  }

  $('#becInputCutblock').on(
    'changed.bs.select',
    function (e, _clickedIndex, _isSelected, _previousValue) {
      console.log(e.target.selectedOptions)
      selected = []
      window.table = e
      var options = e.target.selectedOptions
      for (let i = 0; i < options.length; i++) {
        selected.push(options[i].value)
      }
    },
  )

  // clicking Go button on "I have a cutblock tab"
  document.getElementById('addButtonCutblock').addEventListener('click', function () {
    showLoader('Calculating suitability map and retrieving seedlot data...')
    defineMap.clearLyrs()
    console.log(selected)
    main
      .addSuitabilityLayerCutblock(document.getElementById('speciesInputCutblock').value, selected)
      .then((layers) => {
        console.log(layers)
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
})

// document.getElementById("addButtonCutblock")
// .addEventListener("click", function () {
//     defineMap.clearLyrs();
//     var selected = [];
//     let selectedPromise = new Promise(function (resolve, reject) {
//         $('#becInputCutblock').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
//             console.log(e.target.selectedOptions);
//             window.table = e;
//             // e.target.selectionOptions[clickedIndex].selected = true;
//             var options = e.target.selectedOptions;
//             for (var i = 0; i < options.length; i++) {
//                 selected.push(options[i].value);
//             }
//             console.log(selected);

//         });
//     }).then(function () {
//         console.log(document.getElementById("becInputCutblock").value);
//         main.addSuitabilityLayerCutblock(document.getElementById("speciesInputCutblock").value, selected).then((layers) => {
//             // console.log(layers);
//             defineMap.updateLayer(layers);
//         });
//     });

//     return selectedPromise;

//  });
