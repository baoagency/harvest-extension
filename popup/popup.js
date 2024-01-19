function handleise (string) {
  if(!string) return ''

  return string?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')?.replace(/-$/, '')?.replace(/^-/, '')?.trim()
}

class Popup {
  constructor () {
    this.parameters = new URLSearchParams(
      {
        app_name: 'BAO - Harvest Extension',
        external_item_id: '',
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
    chrome.runtime.onMessage.addListener(this.handleChromeRuntimeMessages.bind(this))
  }

  handleMessage (event) {
    if (event.origin !== 'https://platform.harvestapp.com') return

    this.handleHarvestMessage(event)
  }

  handleHarvestMessage (event) {
    if (event.data.type !== 'frame:resize') return

    document.querySelector('iframe').style.height = `${event.data.value}px`
  }

  async handleDomReady () {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    this.currentTab = tabs[0]
    if(!this.currentTab?.id) return

    chrome.tabs.sendMessage(this.currentTab.id, { type: 'does_content_script_exist' }, (response) => {
      if (!response?.success) {
        chrome.runtime.sendMessage({
          type: 'inject_content_scripts',
          tabId: this.currentTab.id
        })
      } else {
        this.requestPageData()
      }
    })
  }

  requestPageData() {
    chrome.tabs.sendMessage(this.currentTab.id, { type: 'page_data_for_popup' }, this.handleResponseFromTab.bind(this))
  }

  handleChromeRuntimeMessages (request, sender, sendResponse) {
    if(request.type !== 'content_script_loaded') return

    this.requestPageData()
  }

  handleResponseFromTab (response) {
    this.parameters.set('external_item_id', handleise(response?.permalink || response?.title || 1))
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
