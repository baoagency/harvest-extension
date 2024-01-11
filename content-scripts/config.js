window.BAO = window.BAO || {}

window.BAO.HarvestExtension = {
  mode: 'development',
  platforms: [
    {
      hostname: 'basecamp.com',
      selectors: {
        task_title: [
          '.todo__title',
          '.message__subject'
        ],
        group_name: [
          'meta[name="current-bucket-name"]'
        ]
      }
    },
    {
      hostname: 'monday.com',
      selectors: {
        task_title: [
          '.heading-component',
        ],
        group_name: [
          '.workspace-name-wrapper'
        ]
      }
    },
    {
      hostname: 'asana.com',
      selectors: {
        task_title: [
          '.TitleInput-objectName [aria-label="Task Name"]',
        ],
        group_name: [
          'meta[name="shard_id"]'
        ]
      }
    },
    {
      hostname: 'github.com',
      selectors: {
        group_name: [
          '.AppHeader-context-full'
        ]
      }
    }
  ]
}
