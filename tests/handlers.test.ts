// import { getAddressHandler, createUserOpHandler, sendUserOpHandler } from '../handlers';
import { getAddressHandler, sendUserOpHandler } from '../handlers';
import { describe, expect, it, beforeEach, jest } from 'bun:test';
import { Request, Response } from 'express';
import { encodeFunctionData } from 'viem';


const abiItem = {
    inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }, { name: 'data', type: 'bytes' }, { name: 'operation', type: 'uint8' }],
    name: 'execute',
    stateMutability: 'external',
    type: 'function',
}

const encodedCallData = encodeFunctionData({
    abi: [abiItem],
    functionName: 'execute',
    args: ['0xa6ea52EC5a01E92BCb83055d743a1aE9367988b8', BigInt(0), '0x', 0]
});

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
        it('should return address from getAddressHandler', async () => {
            mockRequest.body = { address: '0xa6ea52EC5a01E92BCb83055d743a1aE9367988b8'};
            await getAddressHandler(mockRequest as Request, mockResponse as Response);
            console.log(mockJson.mock.calls[0][0])
            expect(mockJson).toHaveBeenCalledWith({ address: '0x4967ebd74567dE1b091b7833C2B1ef4447A583fD' });
        });
    });

    describe('createUserOpHandler', () => {
        it('should create a user operation and return it', async () => {
            const mockUserOp = {
                callData: encodedCallData,
                executionType: 'REGULAR',
            };
            mockRequest.body = {
                address: '0xa6ea52EC5a01E92BCb83055d743a1aE9367988b8',
                projectId: process.env.ZERODEV_PROJECT_ID,
                chainId: 5,
                executionType: 'REGULAR',
                request: {
                    to: '0xa6ea52EC5a01E92BCb83055d743a1aE9367988b8',
                    value: BigInt(0),
                    data: '0x',
                },
            };
            await createUserOpHandler(mockRequest as Request, mockResponse as Response);
            expect(mockJson).toHaveBeenCalledWith({ userOp: expect.any(Object) });
        });
    });

    describe('sendUserOpHandler', () => {
        it('should send a user operation and return a receipt', async () => {
            const mockReceipt = {
                transactionHash: '0x123',
            };
            mockRequest.body = {
                userOp: {
                    sender: '0x4967ebd74567dE1b091b7833C2B1ef4447A583fD',
                    callData: encodedCallData,
                },
                projectId: process.env.ZERODEV_PROJECT_ID,
                chainId: 80001,
                waitTimeoutMs: 1000,
                waitIntervalMs: 100,
            };
            await sendUserOpHandler(mockRequest as Request, mockResponse as Response);
            expect(mockJson).toHaveBeenCalledWith({ receipt: expect.any(Object) });
        });

        it('should return error if projectId is missing', async () => {
            mockRequest.body = {
                userOp: {
                    sender: '0x4967ebd74567dE1b091b7833C2B1ef4447A583fD',
                    callData: encodedCallData,
                },
                chainId: 80001,
                waitTimeoutMs: 1000,
                waitIntervalMs: 100,
            };
            await sendUserOpHandler(mockRequest as Request, mockResponse as Response);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Project ID is required' });

        });
    });
});