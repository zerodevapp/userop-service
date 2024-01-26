import type { Address, Hex } from 'viem';
import type { UserOperation } from 'permissionless';

export interface GetAddressRequest {
    address: Address;
    index?: number;
    projectId: string;
}

export interface CreateUserOpRequest {
    address: Address;
    index?: number;
    projectId: string;
    chainId: number;
    entryPoint?: Address;
    request: {
        to: Address;
        value: bigint;
        data: Hex;
    } | Array<{
        to: Address;
        value: bigint;
        data: Hex;
    }>;
    sponsored?: boolean;
}

export interface SendUserOpRequest {
    userOperation: UserOperation;
    projectId: string;
    chainId: number;
    entryPoint?: Address;
}