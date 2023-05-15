import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../redux/reducers/rootReducer";
import {List} from "react-native-paper";
import CredentialDetails from "../../models/CredentialDetails";
import {deleteCredential, selectCredentialById} from "../../redux/reducers/credentialsSlice";
import Chat from "../../models/Chat";
import {showGreenSnackBar, showRedSnackBar} from "../../utils/Snackbar";
import {getChat} from "../../utils/ChatUtils";
import {Header} from "../../components/Header";
import {verifyCredential} from "../../utils/CredentialUtils";

export const CredentialViewScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const credentialId: string = route.params.credentialId;
    const credential: CredentialDetails = useSelector((state: RootState) => selectCredentialById(state, credentialId))!
    const dispatch = useDispatch();
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                <Header title="Delete" icon="delete-outline" onPress={async () => {
                    dispatch(deleteCredential(credentialId))
                    console.log('Deleted successfully')
                    navigation.goBack()
                }}/>
        })
    })
    return (
        <ScrollView>
            <List.Section>
                <List.Subheader>Credential</List.Subheader>
                <List.Item
                    title="Verify credential"
                    onPress={async () => {
                        let isValid = await verifyCredential(credential.verifiableCredential)
                        if (isValid) {
                            showGreenSnackBar('Credential is valid')
                        } else {
                            showRedSnackBar('Credential is not valid')
                        }
                    }}
                    right={props => <List.Icon {...props} icon="shield-check-outline"/>}/>
                <List.Item
                    title="Send credential in chat"
                    onPress={() => {
                        console.log('Send credential: ' + JSON.stringify(credential))
                        // Lookup existing chat for this from(issuer)/to(subject) pair
                        // @ts-ignore
                        let issuer: string = credential.verifiableCredential.issuer.id
                        let subject: string = credential.verifiableCredential.credentialSubject.id!
                        let chat: Chat = getChat(issuer, subject)
                        navigation.navigate('ChatMessages', {
                            chatId: chat.id,
                            credentialId: credential.verifiableCredential.id
                        })
                    }}
                    right={props => <List.Icon {...props} icon="arrow-right"/>}/>
                <List.Subheader>Attributes</List.Subheader>
                {
                    Object.keys(credential.verifiableCredential.credentialSubject).filter((attribute) => attribute != 'id').map((attribute, index) => (
                        <List.Item
                            title={attribute}
                            description={credential.verifiableCredential.credentialSubject[attribute]}
                            descriptionNumberOfLines={20}
                        />
                    ))
                }
                <List.Subheader>Details</List.Subheader>
                <List.Item
                    title="Credential id"
                    description={credential.verifiableCredential?.id}
                    descriptionNumberOfLines={20}
                />
                <List.Item
                    title="Credential context"
                    description={JSON.stringify(credential.verifiableCredential?.["@context"])}
                    descriptionNumberOfLines={50}
                />
                <List.Item
                    title="Credential schema id"
                    description={credential?.verifiableCredential?.credentialSchema?.id}
                    descriptionNumberOfLines={20}
                />
                <List.Item
                    title="Credential issuer"
                    // @ts-ignore
                    description={credential.verifiableCredential?.issuer.id}
                    descriptionNumberOfLines={20}
                />
                <List.Item
                    title="Credential subject"
                    description={credential.verifiableCredential?.credentialSubject.id}
                    descriptionNumberOfLines={20}
                />
                <List.Item
                    title="Credential issuance date"
                    description={credential.verifiableCredential?.issuanceDate}
                    descriptionNumberOfLines={20}
                />
                <List.Item
                    title="Credential expiration date"
                    description={credential.verifiableCredential?.expirationDate}
                    descriptionNumberOfLines={20}
                />
                <List.Subheader>Credential raw</List.Subheader>
                <Text style={styles.container}>{JSON.stringify(credential)}</Text>
            </List.Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginLeft: 16,
        marginRight: 16
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold'
    }
})
