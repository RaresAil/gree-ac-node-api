# NODE JS API for Gree Air Conditioner

An API Interface for controlling a Gree Air Conditioner. The code is written in TypeScript based on the hard work from the guys working on and contributing to https://github.com/tomikaa87/gree-remote. I take no credit for the research that went into understanding how the interface works. Thanks a lot guys for your research!

## Required

- NodeJS 16+
- Yarn
- TypeScript knowledge

This is just an API, by default it will only search and bind to the devices,
you need to implement the methods.

The `waitForDevices` from index.ts will return an array of devices (by default is set to return only 1), to send commands use `device.sendCommand(...)`.

## Not implemented by default

The following features are not implemented here, but you can manually implement them.

- Scheduling
- Synchronizing the time on the device

## Config

In the `src/config.json`, there are the following configurations:

```json
{
  "appName": "gree-node",
  "debugMode": true,
  "broadcastAddress": "192.168.50.255",
  "searchTimeout": 30,
  "stopSearchingAtDevices": 1
}
```

- `appName` - Can be any name you want (is used for the logs)
- `debugMode` - If is true, it will display logs
- `broadcastAddress` - What address to use to search for the devices
- `searchTimeout` - How long to wait for a socket response.
- `stopSearchingAtDevices` - If is set to 1, after finding 1 device it will stop searching, if the number of devices found is less then `stopSearchingAtDevices`, it will stop after `searchTimeout`.

## Install Packages

```
yarn install
```

## Build the App

To build the app, use this command.

```
yarn build
```

After the app is built, copy the dist directory where you want, the dist directory is the production version of the app.

After you place the dist version where ever you want, run the following command to install the deps.

```
yarn install
```

## Run after Build

In the dist folder, run

```
yarn start
```
