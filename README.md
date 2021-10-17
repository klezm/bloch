Demo: https://attilakun.net/bloch

# What is this?

This a [Bloch sphere](https://en.wikipedia.org/wiki/Bloch_sphere) simulator. It allows you to enter arbitrary 2x2 matrices and see their effect on the quantum state.

# Requirements to run the project

The project uses Node.js for its build. At the time of writing, the project was confirmed to work with v14.15.1 of Node.js but other versions might be appropriate too. If you want to run multiple different versions of Node.js on your machine, then you might find [nvm](https://github.com/nvm-sh/nvm) useful.

# Running the project

1. Check the repo out
2. Run `npm install`
3. Run `npm run start`

or simply `npm install; npm run start`
or `ncu; npm install; npm run start` (for checking latest packages as well)

# Dev

## Contribute or play with the code

https://stackblitz.com/github/klezm/bloch

## Running the tests

Run

```bash
npm run test
```

to run only a specific test file run:

```bash
npm run test -- tests/parser.test.ts  # jest -- tests/parser.test.ts
```

to run just a specific test run:

```bash
npm run test -- -t 'Pauli-X' # <- the description of the test
```

### update packages

```bash
npm install npm-check-updates
```

or when using stackblitz (which uses turbo instead of yarn or npm)

```bash
turbo add --dev npm-check-updates
```
