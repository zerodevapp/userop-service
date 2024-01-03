import type { Address, Hex } from 'viem';
import type { UserOperation } from 'permissionless';

export interface GetAddressRequest {
    address: Address;
    index?: number;
}

export enum ExecutionType {
    REGULAR = 'REGULAR',
    BATCH = 'BATCH',
}

export interface CreateUserOpRequest {
    address: Address;
    projectId: string;
    chainId: number;
    executionType: ExecutionType;
    request: {
        to: Address;
        value: bigint;
        data: Hex;
    } | Array<{
        to: Address;
        value: bigint;
        data: Hex;
    }>;
}

export interface SendUserOpRequest {
    userOp: UserOperation;
    projectId: string;
    chainId: number;
    waitTimeoutMs: number;
    waitIntervalMs: number;
    entryPoint?: Address;
}