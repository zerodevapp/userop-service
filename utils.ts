import { type Chain, type Address } from "viem";
import type { SmartAccountSigner } from 'permissionless/accounts';
import * as allChains from 'viem/chains';

export function ensureEnvVariables(variables: string[]): void {
    const unsetVariables = variables.filter((v) => !process.env[v]);
    if (unsetVariables.length > 0) {
        throw new Error(`Missing environment variables: ${unsetVariables.join(', ')}`);
    }
}

export function getChainFromId(chainId: number): Chain {
    const chain = Object.values(allChains).find(c => c.id === chainId);
    if (!chain) {
        throw new Error(`Chain with id ${chainId} not found`);
    }
    return chain;
}

export function createNullSmartAccountSigner(address: Address): SmartAccountSigner<string, `0x${string}`> {
    return {
        address: address,
        type: 'local',
        signMessage: async () => {
            throw new Error('Sign message not supported');
        },
        signTypedData: async () => {
            throw new Error('Sign typed data not supported');
        },
        publicKey: '0x',
        source: '0x',
    };
}