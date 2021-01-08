# starworld-mock-api

> A server that responds with mock data.

## Development

Run the linter:

```
npm run watch
```

### Integration Tests

NOTE: These tests probably only work on macos, since using `gtimeout` and `greadlink` in the `wait-for-it.sh` script.

NOTE: If running on macos, you will need `coreutils` installed.

```
brew install coreutils
```

Run tests:

```
npm run test
```

## Usage

This command starts up a service running on a specified port. The command is added to npm's bin as `starworld-mock-api`.

```
Usage: starworld-mock-api -p <num>

Options:
  --version  Show version number      [boolean]
  -h         Show help                [boolean]
  -p         The port to listen on.   [required]
```

The service exposes several endpoints.

### `/_starworld/register`

Register an endpoint with the server. After registering, if this endpoint is queried, it will respond with the data provided in the request. The query part of the URL will be ignored when matching the requested URL (e.g. if your endpoint is '/test', it will match '/test?blah=1'). However, the `endpoint` param provided when registering will not be altered, so if you include a query in it, it likley won't match any requests.

Method: `POST`

Content Type: `application/json`

Parameters:

- **endpoint** *(string, required)* The path of the endpoint you want to register (e.g. `/user/messages`)
- **method** *(string, optional, default: `GET`)* The request method to respond to.
- **status** *(int, optional, default: `200`)* The status to respond with when the endpoint is queried
- **headers** *(object, optional, default: `{'Content-type': 'application/json'}`)* Any response headers to send.
- **respondRaw** *(boolean, optional, default: false)* By default, the response will be sent as JSON. Set this to `true` and the response body will be returned exactly as provided.
- **body** *(any, required)* The response body. By default will send this as JSON string. See `respondRaw` to change this behavior.

Result:

Status: 200, 500 (on error)

### `/_starworld/clear`

Clear one ore all endpoints.

Method: `POST`

Content Type: `application/json`

Parameters:

- **endpoint** *(string, optional)* The endpoint to clear. If not provided, will clear all endpoints
- **method** *(string, optional, default: `GET`)* The method to clear.

Result:

Status: 200, 500 (on error)
