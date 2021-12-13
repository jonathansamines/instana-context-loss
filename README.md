# Instana context loss

## Problem

When the @instana/collector is loaded into a Node.js application, but that application also uses [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked) to propagate and preserve it's own context, then they both seem to conflict and only one context is propagated, furthermore
upon closer inspection, this problem only seems to happen when:

- The request contains a payload
- The request object is explicitly bound through the use of [bindEmitter](https://github.com/Jeff-Lewis/cls-hooked#namespacebindemitteremitter) 

## Reproduction

A reproduction code is included. Use `node` or `docker` to execute it while the instana agent is running.

### Running directly on the host

```bash
$ node server.js
```

### Running as a docker container

```bash
docker build -t test-instana .
docker run --network=host --pid=host --name "test-instana" --rm -ti test-instana:latest node server.js
```

## Test cases

### GET request

```bash
curl -X GET http://127.0.0.1:3000 | jq

{
  "body": {},
  "instana": "e4b87d663e102644",
  "local": "055523c3-ec33-4081-8dfb-001e9367f901"
}
```

### POST request with payload (json)

```bash
curl -X POST http://127.0.0.1:3000 -d '{ "key": "value" }' -H "Content-Type: application/json" | jq

{
  "body": {
    "key": "value"
  },
  "instana": "unknown",
  "local": "6ec05320-bf33-477c-a897-2d95d87b54a7"
}
```

### POST request without payload (json)

```bash
curl -X POST http://127.0.0.1:3000 -H "Content-Type: application/json" | jq

{
  "body": {},
  "instana": "9aa7ad40adbc00ab",
  "local": "d45eea85-1a09-45b0-9727-a3cb433b8a5d"
}
```

### POST request with payload (form)

```bash
curl -X POST http://127.0.0.1:3000 -d 'key=value' -H "Content-Type: application/x-www-form-urlencoded" | jq

{
  "body": {
    "key": "value"
  },
  "instana": "unknown",
  "local": "a862b3f3-c46f-42fd-a5a8-06e89d9febe0"
}
```

### POST request without payload (form)

```bash
curl -X POST http://127.0.0.1:3000 -H "Content-Type: application/x-www-form-urlencoded" | jq

{
  "body": {},
  "instana": "a02de9971d2f0bc2",
  "local": "e31d99fa-d19b-464b-8549-5d5929e9d368"
}
```

## Notes

- The samples above are meant to demostrate that the Instana instrumentation breaks under this conditions. When this happens on our production systems, only self time is recorded and no additional services appear on traces.
- If binding of the `request` event emitter is removed, then the `instana` traces work again but the `local` context is lost