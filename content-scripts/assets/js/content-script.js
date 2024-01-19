function removeNewLines (string) {
  if(!string) return ''

  return string.replace(/(\r\n|\n|\r)/gm, '')?.trim()
}

function handleise (string) {
  if(!string) return ''

  return string?.toLowerCase()?.replace(/[^a-z0-9]+/g, '-')?.replace(/-$/, '')?.replace(/^-/, '')?.trim()
}

class ContentScript {
  static config = {
    mode: window.BAO?.HarvestExtension?.mode,
    platforms: window.BAO?.HarvestExtension?.platforms
  }

  constructor () {
    chrome.runtime.sendMessage({ type: 'content_script_loaded' })

    this.setupListeners()
  }

  setupListeners () {
    chrome.runtime.onMessage.addListener(this.handleChromeRuntimeMessages.bind(this))
  }

  handleChromeRuntimeMessages (request, sender, sendResponse) {
    if (request.type === 'does_content_script_exist') {
      sendResponse({ success: true })
    }

    if (request.type === 'page_data_for_popup') {
      this.sendPageDataForPopup(sendResponse)
    }
    return true
  }

  sendPageDataForPopup(sendResponse) {
    const response = {
      title: this.taskTitle,
      group_id: this.groupId,
      group_name: this.groupName,
      permalink: window.location.href,
    }

    this.log(response)

    sendResponse(response)
  }

  log (param) {
    if(this.isProduction) return

    console.log(param)
  }

  get selectors () {
    const platform = this.platforms.find(platform => window.location.href.includes(platform?.hostname))
    if(!platform) return []

    return platform?.selectors
  }

  get platforms () {
    return this.constructor?.config?.platforms || []
  }

  get taskTitle () {
    const titleEls = document.querySelectorAll(this?.selectors?.task_title?.join(', '))

    return removeNewLines(titleEls?.[0]?.textContent || this.pageTitle)
  }

  get pageTitle () {
    return document?.title || ''
  }

  get groupId () {
    return handleise(this.groupName)
  }

  get groupName () {
    const groupNameEls = document.querySelectorAll(this?.selectors?.group_name?.join(', '))
    const groupNameEl = groupNameEls?.[0]

    return groupNameEl?.getAttribute('content') || removeNewLines(groupNameEl?.textContent) || window.location.hostname || ''
  }

  get mode () {
    return this.constructor?.config?.mode || 'production'
  }

  get isProduction () {
    return this.mode === 'production'
  }
}

const contentScript = new ContentScript()
