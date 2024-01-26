import type { Request, Response } from 'express';
import type {
    GetAddressRequest,
    CreateUserOpRequest,
    SendUserOpRequest,
} from './types';
import { http, toHex } from 'viem';
import { ensureEnvVariables } from './utils';
import { getChainFromId, createNullSmartAccountSigner } from './utils';
import {
    KERNEL_ADDRESSES,
    createKernelAccount,
    createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { createPublicClient } from 'viem';
import {
    prepareUserOperationRequest,
    type PrepareUserOperationRequestParameters,
} from 'permissionless/actions/smartAccount';
import {
    sendUserOperation,
    createBundlerClient,
    getUserOperationHash,
    deepHexlify,
} from 'permissionless';

const BUNDLER_URL = process.env.BUNDLER_URL || '';
const PAYMASTER_URL = process.env.PAYMASTER_URL || '';

ensureEnvVariables(['BUNDLER_URL', 'PAYMASTER_URL']);

export async function getAddressHandler(req: Request, res: Response) {
    const { address, index, projectId }: GetAddressRequest = req.body;

    const publicClient = createPublicClient({
        transport: http(`${BUNDLER_URL}/${projectId}`),
    });

    const signer = createNullSmartAccountSigner(address);

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
    });

    const account = await createKernelAccount(publicClient, {
        plugins: {
            validator: ecdsaValidator,
        },
        index: BigInt(index || 0),
    });

    res.json({ address: account.address });
}

export async function createUserOpHandler(
    req: Request,
    res: Response
): Promise<void> {
    const {
        address,
        index,
        projectId,
        chainId,
        request,
        entryPoint,
    }: CreateUserOpRequest = req.body;

    const signer = createNullSmartAccountSigner(address);

    const publicClient = createPublicClient({
        transport: http(`${BUNDLER_URL}/${projectId}`),
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint: entryPoint || KERNEL_ADDRESSES.ENTRYPOINT_V0_6,
    });

    const account = await createKernelAccount(publicClient, {
        plugins: {
            validator: ecdsaValidator,
        },
        index: BigInt(index || 0),
    });
    const encodedCallData = await account.encodeCallData(request);
    const prepareUserOperationRequestArgs: PrepareUserOperationRequestParameters =
        {
            account,
            userOperation: { callData: encodedCallData },
        };
    let preparedUserOperation = await prepareUserOperationRequest(
        publicClient,
        prepareUserOperationRequestArgs
    );
    const kernelPaymasterClient = createZeroDevPaymasterClient({
        chain: getChainFromId(chainId),
        transport: http(`${PAYMASTER_URL}/${projectId}`),
    });
    try {
        preparedUserOperation =
            await kernelPaymasterClient.sponsorUserOperation({
                userOperation: preparedUserOperation,
            });
    } catch (error) {}

    const hash = getUserOperationHash({
        userOperation: {
            ...deepHexlify(preparedUserOperation),
            signature: '0x',
        },
        entryPoint: entryPoint || KERNEL_ADDRESSES.ENTRYPOINT_V0_6,
        chainId: chainId,
    });

    const userOpJson = JSON.stringify(preparedUserOperation, (key, value) =>
        typeof value === 'bigint' ? toHex(value) : value
    );

    res.json({ userOperation: preparedUserOperation, userOpHash: hash });
}

export async function sendUserOpHandler(req: Request, res: Response) {
    const { userOperation, projectId, chainId, entryPoint }: SendUserOpRequest =
        req.body;
    const bundlerClient = createBundlerClient({
        chain: getChainFromId(chainId),
        transport: http(`${BUNDLER_URL}/${projectId}`),
    });
    const userOpHash = await sendUserOperation(bundlerClient, {
        userOperation,
        entryPoint: entryPoint || KERNEL_ADDRESSES.ENTRYPOINT_V0_6,
    });

    res.json({ userOpHash });
}
