import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'r18wndg7',
    dataset: 'production'
  },
  deployment: {
    autoUpdates: false,
  },
})
