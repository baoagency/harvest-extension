window.BAO = window.BAO || {}

window.BAO.HarvestExtension = {
  mode: 'production',
  /* An array of Platforms requiring custom configuration */
  platforms: [
    {
      /* The hostname of the platform eg basecamp.com, monday.com, asana.com */
      hostname: '',
      selectors: {
        /* An array of css selectors for elements which are able to contain the name of the task eg '.todo__title' */
        /* The value of the <title> element is used by default */
        task_title: [],
        /* An array of css selectors for elements which are able to contain the name of the merchant eg 'meta[name="current-bucket-name"]' */
        group_name: []
      }
    },
  ]
}
