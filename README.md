# Jira Timetracker (jira-timetracker)

Time Tracking UI for JIRA

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).


## Get Jira Cloud ID

Execute this command on your jira site to get your cloud id:
```js
document.querySelector('meta[name=ajs-cloud-id]').getAttribute('content')
```