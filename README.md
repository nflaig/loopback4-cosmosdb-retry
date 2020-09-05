# loopback4-cosmosdb-retry

[![Actions Status](https://github.com/nflaig/loopback4-cosmosdb-retry/workflows/build/badge.svg)](https://github.com/nflaig/loopback4-cosmosdb-retry/actions)
[![Coverage Status](https://coveralls.io/repos/github/nflaig/loopback4-cosmosdb-retry/badge.svg?branch=refs/heads/master)](https://coveralls.io/github/nflaig/loopback4-cosmosdb-retry?branch=refs/heads/master)
[![Dependencies Status](https://david-dm.org/nflaig/loopback4-cosmosdb-retry/status.svg)](https://david-dm.org/nflaig/loopback4-cosmosdb-retry)

[![Latest version](https://img.shields.io/npm/v/loopback4-cosmosdb-retry.svg?style=flat-square)](https://www.npmjs.com/package/loopback4-cosmosdb-retry)
[![License](https://img.shields.io/github/license/nflaig/loopback4-cosmosdb-retry.svg?color=blue&label=License&style=flat-square)](https://github.com/nflaig/loopback4-cosmosdb-retry/blob/master/LICENSE)
[![Downloads](https://img.shields.io/npm/dw/loopback4-cosmosdb-retry.svg?label=Downloads&style=flat-square&color=blue)](https://www.npmjs.com/package/loopback4-cosmosdb-retry)
[![Total Downloads](https://img.shields.io/npm/dt/loopback4-cosmosdb-retry.svg?label=Total%20Downloads&style=flat-square&color=blue)](https://www.npmjs.com/package/loopback4-cosmosdb-retry)

LoopBack 4 data source mixin to handle database operation retries in case of Azure Cosmos DB request
limit errors caused by exceeding the available [Request Units][request-units].

## Prerequisites

Some dependencies need to be installed as peer dependencies

```shell
@loopback/repository
```

## Installation

```shell
npm install loopback4-cosmosdb-retry
```

## Usage

The mixin just needs to added to the data source

```ts
import { juggler } from "@loopback/repository";
import { RetryMixin } from "loopback4-cosmosdb-retry";

class CosmosdbDataSource extends RetryMixin(juggler.DataSource) {}
```

## Configuration

The [default values][default-values] can be directly overwritten in the data source class

```ts
class CosmosdbDataSource extends RetryMixin(juggler.DataSource) {
    constructor(args) {
        super(args);

        this.maxRetries = 19; // do 19 retries after the first request (default: 9)
        this.retryAfterInMs = 2000; // default delay after each request if no suggested delay is in error response (default: 1000)
        this.retryAfterPaddingInMs = 200; // additional delay to add to the suggested delay in error response (default: 0)
        this.useFixedRetryInterval = false; // always use fixed retry interval based on retryAfterInMs (default: false)
    }
}
```

or by using environment variables

> .env

```sh
MAX_RETRIES=19
RETRY_AFTER_IN_MS=2000
RETRY_AFTER_PADDING_IN_MS=200
USE_FIXED_RETRY_INTERVAL=false
```

**Note:** The values you are setting directly in your code will have precedence over the environment variables.
If you want to be able to set values in your code while also having the options to overwrite with environment variables
you need to manually handle this.

```ts

// ...

    constructor(args) {
        super(args);

        this.maxRetries =  Number(process.env.MAX_RETRIES) ?? 19;
    }

// ...

```

## Related resources

- [LoopBack 4 Mixins ][lb4-mixins]
- [Request Units in Azure Cosmos DB][request-units]

## Contributing

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/nflaig/loopback4-cosmosdb-retry/issues)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

[request-units]: http://aka.ms/cosmosdb-error-429
[lb4-mixins]: https://loopback.io/doc/en/lb4/Mixin.html
[default-values]: https://github.com/nflaig/loopback4-cosmosdb-retry/blob/master/src/retry.ts#L4
