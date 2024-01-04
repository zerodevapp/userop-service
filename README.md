# Express Server for User Operations

This Express server provides an API for getting Kernel account addresses from the signer address and handling user operations, including creating and sending signed user operations to a bundler.

## Prerequisites

- [Bun](https://bun.sh/) must be installed on your system.

## Installation

1. Clone the repository to your local machine.
2. Navigate to the cloned directory.
3. Run `bun install` to install the dependencies.

## Environment Variables

Create a `.env` file in the root of your project.  You can copy the `.env.example` file.

- `PORT`: The port the Express server will listen on.
- `BUNDLER_URL`: The ZeroDev Bundler URL.
- `PAYMASTER_URL`: The ZeroDev Paymaster URL.
- `ZERODEV_PROJECT_ID`: Your ZeroDev project ID, used for testing.
- `PRIVATE_KEY`: Your private key, used only for testing when creating signed user operations in the `sendUserOpHandler` test.

**Note:** `ZERODEV_PROJECT_ID` and `PRIVATE_KEY` are used only for testing purposes. The tests use a well-known private key for Ethereum address 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 for convenience of testing.

## Running the Server

Execute `bun start` to run the server. The server will listen for requests on the defined port in your environment configuration.

## Tests

The server includes a test suite to validate the handlers for fetching account addresses and user operations. To run the tests, execute `bun test`.

## Handlers

### `getAddressHandler`

Returns an address based on the provided request body. It requires the following parameters:

- `address`: The address of the signer.
- `index`: (Optional) The index of the account to use.
- `projectId`: The project ID for the bundler service.

### `createUserOpHandler`

Creates a user operation from the request body. It requires the following parameters:

- `address`: The address of the signer.
- `index`: (Optional) The index of the account to use.
- `projectId`: The project ID for the bundler service.
- `chainId`: The ID of the blockchain network.
- `request`: The request object containing the operation details.
- `entryPoint`: (Optional) The entry point address for the operation.

### `sendUserOpHandler`

Sends a signed user operation to the bundler. It requires the following parameters:

- `userOperation`: The `UserOperation` object to be sent.
- `projectId`: The project ID associated with the user operation.
- `chainId`: The blockchain network ID where the operation will be executed.
- `entryPoint`: (Optional) The entry point address for the operation.
