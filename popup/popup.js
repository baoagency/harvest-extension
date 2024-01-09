class Popup {
  constructor () {
    this.parameters = new URLSearchParams(
      {
        app_name: 'BAO - Harvest Extension',
        external_item_id: 1,
        external_item_name: '',
        external_group_id: '',
        external_group_name: '',
        permalink: '',
        closable: false,
        chromeless: false,
        default_project_code: '',
        default_project_name: ''
      }
    )

    this.setupListeners()
  }

  setupListeners  () {
    window.addEventListener('message', this.handleMessage.bind(this))
    document.addEventListener('DOMContentLoaded', this.handleDomReady.bind(this))
  }

  handleMessage (event) {
    if (event.origin !== 'https://platform.harvestapp.com') return

    this.handleHarvestMessage(event)
  }

  handleHarvestMessage (event) {
    if (event.data.type !== 'frame:resize') return

    document.querySelector('iframe').style.height = `${event.data.value}px`
  }

  handleDomReady () {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0]?.id, { type: 'page_data_for_popup' }, this.handleResponseFromTab.bind(this))
    })
  }

  handleResponseFromTab (response) {
    this.parameters.set('external_item_name', response?.title || '')
    this.parameters.set('external_group_id', response?.group_id || '')
    this.parameters.set('external_group_name', response?.group_name || '')
    this.parameters.set('permalink', response?.permalink || '')

    this.deleteEmptyKeys()
    this.injectIframe()
  }

  deleteEmptyKeys () {
    const keysToDelete = []

    for (const [key, value] of this.parameters.entries()) {
      if (!value.length) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.parameters.delete(key))
  }

  injectIframe () {
    const url = new URL('https://platform.harvestapp.com/platform/timer')
    url.search = this.parameters.toString()

    const iframeEl = document.createElement('iframe')
    iframeEl.setAttribute('src', url.toString())

    this.el?.appendChild(iframeEl)
  }

  get el () {
    return document.getElementById('app')
  }
}

const popup = new Popup()
