import {
    ensureEnvVariables,
    getChainFromId,
    createNullSmartAccountSigner,
} from '../utils';
import { describe, expect, it } from 'bun:test';
import * as allChains from 'viem/chains';
import type { Chain } from 'viem';
import { zeroAddress } from 'viem';
import { SignTransactionNotSupportedBySmartAccount } from 'permissionless/accounts';

describe('utils', () => {
    describe('ensureEnvVariables', () => {
        it('should not throw an error if all environment variables are set', () => {
            process.env.TEST_VAR = 'test';
            expect(() => ensureEnvVariables(['TEST_VAR'])).not.toThrow();
        });

        it('should throw an error if any environment variable is not set', () => {
            delete process.env.TEST_VAR;
            expect(() => ensureEnvVariables(['TEST_VAR'])).toThrow(
                'Missing environment variables: TEST_VAR'
            );
        });
    });

    describe('getChainFromId', () => {
        it('should return the correct chain for a given id', () => {
            const chainId: number = 5;
            const expectedChain: Chain = allChains.goerli;
            expect(getChainFromId(chainId)).toEqual(expectedChain);
        });

        it('should throw an error if the chain id is not found', () => {
            const invalidChainId = 9999;
            expect(() => getChainFromId(invalidChainId)).toThrow(
                `Chain with id ${invalidChainId} not found`
            );
        });
    });

    describe('createNullSmartAccountSigner', () => {
        it('should create a signer with the provided address', () => {
            const address = '0xa6ea52EC5a01E92BCb83055d743a1aE9367988b8';
            const signer = createNullSmartAccountSigner(address);
            expect(signer.address).toBe(address);
        });

        it('should throw an error when trying to sign a message', async () => {
            const signer = createNullSmartAccountSigner('0x123');
            let errMsg = '';
            try {
                await signer.signMessage({ message: 'hello world' });
            } catch (error: any) {
                errMsg = error.message;
            }
            return expect(errMsg).toBe('Sign message not supported');
        });

        it('should throw an error when trying to sign typed data', async () => {
            const signer = createNullSmartAccountSigner('0x123');
            const domain = {
                chainId: 1,
                name: 'Test',
                verifyingContract: zeroAddress,
            };

            const primaryType = 'Test';

            const types = {
                Test: [
                    {
                        name: 'test',
                        type: 'string',
                    },
                ],
            };

            const message = {
                test: 'hello world',
            };
            let errMsg = '';
            try {
                await signer.signTypedData({
                    domain,
                    primaryType,
                    types,
                    message,
                });
            } catch (error: any) {
                errMsg = error.message;
            }
            expect(errMsg).toBe('Sign typed data not supported');
        });
    });
});
