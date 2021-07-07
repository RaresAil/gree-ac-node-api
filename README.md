# NODE JS API for Gree Air Conditioner

An API Interface for controlling a Gree Air Conditioner. The code is written in TypeScript based on the hard work from the guys working on and contributing to https://github.com/tomikaa87/gree-remote. I take no credit for the research that went into understanding how the interface works. Thanks a lot guys for your research!

## Required

- NodeJS 16+
- Yarn
- TypeScript knowledge

This is just an API, by default it will only search and bind to the devices,
you need to implement the methods.

The `waitForDevices` from index.ts will return an array of devices (by default is set to return only 1), to send commands use `device.sendCommand(...)`.

If you want to always search for devices, use `DeviceFinder.scan('address', 0)` and `DeviceFinder.on('device-found', (device) => ...)`.

## Logs

To enable the logs, use the `debug` package.
e.g.

```js
debug.enable('gree-ac-api:*');
```

## Not implemented by default

The following features are not implemented here, but you can manually implement them.

- Scheduling
- Synchronizing the time on the device

## Setup

Create your own nodejs project and install the package with:
```
yarn add gree-ac-api
```
or
```
npm install gree-ac-api
```