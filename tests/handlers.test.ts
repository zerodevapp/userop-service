import { getAddressHandler, createUserOpHandler, sendUserOpHandler } from '../handlers';
import { signUserOperationHashWithECDSA } from "permissionless/utils";
import { describe, expect, it, beforeEach, jest } from 'bun:test';
import { Request, Response } from 'express';
import { UserOperation } from 'permissionless';
import { type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { KERNEL_ADDRESSES } from '@kerneljs/core';

const privateKey: Hex = process.env.PRIVATE_KEY as `0x${string}` || '0x';
const projectId: string = process.env.ZERODEV_PROJECT_ID as string || '';

describe('handlers', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockSend: jest.Mock;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    beforeEach(() => {
        mockSend = jest.fn();
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({
            send: mockSend,
            json: mockJson,
        });
        mockResponse = {
            status: mockStatus,
            json: mockJson,

        };
        mockRequest = {};
    });

    describe('getAddressHandler', () => {
        it('should return correct address from getAddressHandler', async () => {
            mockRequest.body = { address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', projectId };
            await getAddressHandler(mockRequest as Request, mockResponse as Response);
            expect(mockJson).toHaveBeenCalledWith({ address: '0xB2358b064F5eA10543Cf8034C8576b2E6Bfd3Be3' });
        });

        it('should return correct address with index from getAddressHandler', async () => {
            mockRequest.body = { address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', index: 10, projectId };
            await getAddressHandler(mockRequest as Request, mockResponse as Response);
            expect(mockJson).toHaveBeenCalledWith({ address: '0xCA12337b576cC4B328a4Ac8F77E6326929660dc8' });
        });
    });

    describe('createUserOpHandler', () => {
        it('should create a user operation and return it', async () => {
            mockRequest.body = {
                address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                projectId: process.env.ZERODEV_PROJECT_ID,
                chainId: 80001,
                request: {
                    to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                    value: BigInt(0),
                    data: '0x',
                },
            };
            await createUserOpHandler(mockRequest as Request, mockResponse as Response);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    userOperation: expect.objectContaining({
                        sender: expect.any(String),
                        nonce: expect.any(BigInt),
                        initCode: expect.any(String),
                        callData: expect.any(String),
                        paymasterAndData: expect.any(String),
                        signature: expect.any(String),
                        maxFeePerGas: expect.any(BigInt),
                        maxPriorityFeePerGas: expect.any(BigInt),
                        callGasLimit: expect.any(BigInt),
                        verificationGasLimit: expect.any(BigInt),
                        preVerificationGas: expect.any(BigInt),

                    })
                })
            );
        });

        it('should create a user operation out of batch request and return it', async () => {
            mockRequest.body = {
                address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                projectId: process.env.ZERODEV_PROJECT_ID,
                chainId: 80001,
                request: [{
                    to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                    value: BigInt(0),
                    data: '0x',
                }, {
                    to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                    value: BigInt(0),
                    data: '0x',
                }],
            };
            await createUserOpHandler(mockRequest as Request, mockResponse as Response);
            expect(mockJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    userOperation: expect.objectContaining({
                        sender: expect.any(String),
                        nonce: expect.any(BigInt),
                        initCode: expect.any(String),
                        callData: expect.any(String),
                        paymasterAndData: expect.any(String),
                        signature: expect.any(String),
                        maxFeePerGas: expect.any(BigInt),
                        maxPriorityFeePerGas: expect.any(BigInt),
                        callGasLimit: expect.any(BigInt),
                        verificationGasLimit: expect.any(BigInt),
                        preVerificationGas: expect.any(BigInt),

                    })
                })
            );
        });
    });

    describe('sendUserOpHandler', () => {
        it('should send a user operation and return a receipt', async () => {
            mockRequest.body = {
                address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                projectId: process.env.ZERODEV_PROJECT_ID,
                chainId: 80001,
                request: {
                    to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                    value: BigInt(0),
                    data: '0x',
                },
            };
            await createUserOpHandler(mockRequest as Request, mockResponse as Response);
            const userOperation: UserOperation = mockJson.mock.calls[0][0].userOperation;

            const signer = privateKeyToAccount(privateKey);

            userOperation.signature = '0x00000000' + (await signUserOperationHashWithECDSA({
                account: signer,
                userOperation,
                entryPoint: KERNEL_ADDRESSES.ENTRYPOINT_V0_6,
                chainId: 80001,

            })).slice(2) as Hex;

            mockRequest.body = {
                userOperation,
                projectId: process.env.ZERODEV_PROJECT_ID,
                chainId: 80001,
            };

            await sendUserOpHandler(mockRequest as Request, mockResponse as Response);

            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                userOpHash: expect.any(String)
            }));
        });
    });
});