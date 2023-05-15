import * as constants from "../src/veramo/setup";
import {agent} from "../src/veramo/setup";
import {testAgent} from "../src/veramo/testSetup";
import {getConnection} from "typeorm/globals";
import {VerifiableCredential} from "@veramo/core";
import {CredentialPayload} from "@veramo/core/src/types/vc-data-model";

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-qrcode-scanner', () => jest.fn());

beforeAll(() => {
    Object.defineProperty(constants, 'agent', {value: testAgent})
});
afterEach(async () => {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
        const repository = getConnection().getRepository(entity.name); // Get repository
        await repository.clear(); // Clear each entity table's content
    }
});

describe('Validate credentials', () => {
    it('Validate JWT credential', async () => {
        const identifier = await agent.didManagerCreate({
            provider: 'did:key'
        })
        expect(identifier).toHaveProperty('did')
        let credential: CredentialPayload =
            {
                issuer: {id: identifier.did},
                '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/contexts/acvc/v1'],
                type: ['VerifiableCredential', 'AccessControl'],
                issuanceDate: new Date().toISOString(),
                credentialSchema: {"id": "ae8aba09-a8f6-4962-aa7c-8e323c7ef597", "type": "JsonSchemaValidator2018"},
                credentialSubject: {
                    name: 'Firstname Lastname',
                    role: 'Admin'
                },
            }
        let signedJWTCredential: VerifiableCredential = await agent.createVerifiableCredential({
            credential: credential,
            proofFormat: 'jwt',
        })
        console.log(signedJWTCredential)

        let isValid = await agent.verifyCredential({
            credential: signedJWTCredential.proof.jwt
        })
        expect(isValid).toBe(true)
    })
    it('Validate LD credential', async () => {
        const identifier = await agent.didManagerCreate({
            provider: 'did:key'
        })
        expect(identifier).toHaveProperty('did')
        let credential: CredentialPayload =
            {
                issuer: {id: identifier.did},
                '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/contexts/acvc/v1'],
                type: ['VerifiableCredential', 'AccessControl'],
                issuanceDate: new Date().toISOString(),
                credentialSchema: {"id": "ae8aba09-a8f6-4962-aa7c-8e323c7ef597", "type": "JsonSchemaValidator2018"},
                credentialSubject: {
                    name: 'Firstname Lastname',
                    role: 'Admin'
                },
            }
        let signedLDCredential: VerifiableCredential = await agent.createVerifiableCredential({
            credential: credential,
            proofFormat: 'lds',
        })
        console.log(signedLDCredential)

        let isValid = await agent.verifyCredential({
            credential: signedLDCredential
        })
        expect(isValid).toBe(true)
    })
})
