import {VerifiableCredential, VerifiablePresentation} from "@veramo/core";
import {agent} from "../veramo/setup";
import {v4 as uuidv4} from "uuid";
import CredentialDetails from "../models/CredentialDetails";
import {addCredential} from "../redux/reducers/credentialsSlice";
import store from "../redux/store/Store";
import Schema from "../models/Schema";
import {CredentialPayload} from "@veramo/core/src/types/vc-data-model";

export const saveCredential = async (schema: Schema, issuer: string, subject: string, attributeValues: string[]): Promise<boolean> => {
    let credentialId = uuidv4()
    let credentialSubject: { [key: string]: any } = {
        "id": subject
    }
    schema.attributes.forEach((attribute, index) => {
        credentialSubject[attribute] = attributeValues[index]
    })
    let unsignedCredential: CredentialPayload = {
        "@context": schema.credential.context,
        type: schema.credential.type,
        id: credentialId,
        credentialSchema: {id: schema.id, type: 'JsonSchemaValidator2018'},
        credentialSubject: credentialSubject,
        issuanceDate: "",
        issuer: {id: issuer},
    }
    let signedCredential: VerifiableCredential = await agent.createVerifiableCredential({
        credential: unsignedCredential,
        proofFormat: schema.credential.proofFormat
    })
    let credentialDetails: CredentialDetails = {
        id: credentialId,
        verifiableCredential: signedCredential,
        issued: true
    }
    store.dispatch(addCredential(credentialDetails))
    return true
}

export const verifyCredential = async (verifiableCredential: VerifiableCredential): Promise<boolean> => {
    try {
        return await agent.verifyCredential({
            credential: verifiableCredential
        })
    } catch (e) {
        return false
    }
}

export const verifyPresentation = async (verifiablePresentation: VerifiablePresentation): Promise<boolean> => {
    try {
        return await agent.verifyPresentation({
            presentation: verifiablePresentation,
            challenge: 'TEST_CHALLENGE_STRING'
        })
    } catch (e) {
        return false
    }
}
