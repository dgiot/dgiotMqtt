# dgiotmqtt

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square" alt="Software License" />
  </a>
  <a href="https://www.npmjs.com/package/@dgiot/dgiotmqtt">
    <img src="https://img.shields.io/npm/v/@dgiot/dgiotmqtt.svg?style=flat-square" alt="Packagist" />
  </a>
  <a href="https://travis-ci.com/github/dgiot/dgiotmqtt" target="_blank" rel="noopener noreferrer">
    <img alt="Travis CI" src="https://img.shields.io/travis/dgiot/dgiotmqtt.svg">
  </a>
  <a href="https://codecov.io/gh/dgiot/dgiotmqtt" target="_blank" rel="noopener noreferrer">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/dgiot/dgiotmqtt.svg">
  </a>
</p>

## Installation

```bash
yarn add @dgiot/dgiotmqtt
```

## Usage

### es module

```javascript
import * as dgiotmqtt from '@dgiot/dgiotmqtt';
```

```javascript
import dgiotmqtt from '@dgiot/dgiotmqtt';
```

### commonjs

command:

```bash
yarn init -y
yarn add  esm @dgiot/dgiotmqtt
```

for example:

```javascript
const dgiotmqtt = require('@dgiot/dgiotmqtt');
```

```javascript
const dgiotmqtt = require('@dgiot/dgiotmqtt');
```

## Use

### Start calling the initialization method

```javascript
dgiotmqtt.methods.initMqtt({
  id: '10',
  ip: '****************',
  port: 61623,
  success: function () {
    console.log('dgiotmqtt连接成功');
  },
  error: function () {
    console.log('dgiotmqtt连接失败');
  },
  connectLost: function () {
    console.log('dgiotmqtt连接丢失');
  },
  onMessage: function (message) {
    console.log('dgiotmqtt', message);
  },
});
```
