import type { Request, Response } from 'express';
import { createEcdsaKernelAccountClient } from '@kerneljs/presets/zerodev';
import type { GetAddressRequest, CreateUserOpRequest, SendUserOpRequest } from './types';
import { http } from 'viem';
import { ensureEnvVariables } from './utils';
import {
    createKernelPaymasterClient,
} from "@kerneljs/core";
import { getChainFromId, createNullSmartAccountSigner } from './utils';
import type { SmartAccountClient, UserOperation } from "permissionless"

const PAYMASTER_URL = process.env.PAYMASTER_URL || '';
const ZERODEV_PROJECT_ID = process.env.ZERODEV_PROJECT_ID || '';
const DEFAULT_CHAIN_ID = process.env.DEFAULT_CHAIN_ID ? parseInt(process.env.DEFAULT_CHAIN_ID) : 10;

ensureEnvVariables(['ZERODEV_PROJECT_ID', 'PAYMASTER_URL', 'DEFAULT_CHAIN_ID']);

export async function getAddressHandler(req: Request, res: Response) {
    const { address, index }: GetAddressRequest = req.body;
    const kernelClient = await createEcdsaKernelAccountClient({
        chain: getChainFromId(DEFAULT_CHAIN_ID),
        projectId: ZERODEV_PROJECT_ID,
        signer: createNullSmartAccountSigner(address),
        index: BigInt(index || 0),
    });

    res.json({ address: kernelClient.account });
}


// export async function createUserOpHandler(req: Request, res: Response): Promise<void> {
//     const { address, projectId, chainId, executionType, request }: CreateUserOpRequest = req.body;
//     ensureEnvVariables(['ZERODEV_PROJECT_ID']);

//     const signer = createNullSmartAccountSigner(address);
//     const kernelClient: SmartAccountClient = await createEcdsaKernelAccountClient({
//         chain: getChainFromId(chainId),
//         projectId,
//         signer,
//     });
 

//     res.json({ userOp });
// }

export async function sendUserOpHandler(req: Request, res: Response) {
    const { userOp, projectId, chainId, waitTimeoutMs, waitIntervalMs, entryPoint }: SendUserOpRequest = req.body;
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }
    const signer = createNullSmartAccountSigner(userOp.sender);
    const kernelClient = await createEcdsaKernelAccountClient({
        chain: getChainFromId(chainId),
        projectId,
        signer,
    });
    const receipt = await kernelClient.sendUserOperation({ userOperation: userOp });

    res.json({ receipt });
}