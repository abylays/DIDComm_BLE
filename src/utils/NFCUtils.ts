import NfcManager, {Ndef, NdefRecord, NfcTech} from "react-native-nfc-manager";
import {messageHandler} from "../protocols/Protocols";

export const readNdef = async (): Promise<boolean> => {
    try {
        // Pre-step, call this before any NFC operations
        NfcManager.start();

        // register for the NFC tag with NDEF in it
        await NfcManager.requestTechnology(NfcTech.Ndef);
        // the resolved tag object will contain `ndefMessage` property
        const tag = await NfcManager.getTag();
        console.log('NFC tag found: ' + JSON.stringify(tag))
        // @ts-ignore
        const ndefRecords = tag.ndefMessage;
        let parsed = ndefRecords.map(decodeNdefRecord);
        let data = parsed[0][1]
        if (parsed) {
            return await messageHandler.handleOOBMessage(data)
        }
    } catch (ex) {
        console.warn('Error with NFC reading!', ex);
    } finally {
        // stop the nfc scanning
        await NfcManager.cancelTechnologyRequest();
    }
    return false
}

export const writeNdef = async (messageToWrite: string) => {
    let records: NdefRecord[] = [
        Ndef.uriRecord(messageToWrite),
    ]
    let result = false;
    try {
        // Pre-step, call this before any NFC operations
        NfcManager.start();

        // STEP 1
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const bytes = Ndef.encodeMessage(records);
        if (bytes) {
            await NfcManager.ndefHandler // STEP 2
                .writeNdefMessage(bytes); // STEP 3
            result = true;
        }
    } catch (ex) {
        console.warn(ex);
    } finally {
        // STEP 4
        await NfcManager.cancelTechnologyRequest();
    }
    return result;
}

function decodeNdefRecord(record: NdefRecord) {
    if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
        // @ts-ignore
        return ['text', Ndef.text.decodePayload(record.payload)];
    } else if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
        // @ts-ignore
        return ['uri', Ndef.uri.decodePayload(record.payload)];
    }

    return ['unknown', '---']
}
