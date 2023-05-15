import * as React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import {FlatList, View} from 'react-native';
import {ActivityIndicator, Chip, IconButton, TextInput} from "react-native-paper";
import {ChatMessageItem} from "./ChatMessageItem";
import {selectChatById} from "../../redux/reducers/chatsSlice";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/reducers/rootReducer";
import Chat from "../../models/Chat";
import store from "../../redux/store/Store";
import MessageDetails from "../../models/MessageDetails";
import CredentialDetails from "../../models/CredentialDetails";
import {selectCredentialById} from "../../redux/reducers/credentialsSlice";
import Presentation from "../../models/Presentation";
import {selectPresentationById} from "../../redux/reducers/presentationsSlice";
import {basicMessage, issueCredentialMessage, verifierService} from "../../protocols/Protocols";
import {Header} from "../../components/Header";
import {getChatMessages} from "../../utils/ChatUtils";
import {VerifiableCredential} from '@veramo/core';

export interface ChatMessage {
    chatId: string
    isTheirs: boolean
    message: MessageDetails
}

export const ChatMessagesScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const {chatId, credentialId, presentationId} = route.params;
    const chat: Chat = useSelector((state: RootState) => selectChatById(state, chatId))!
    const [messageText, setMessageText] = useState("");
    const [credential, setCredential] = useState<VerifiableCredential | undefined>();
    const [presentation, setPresentation] = useState<Presentation | undefined>();
    const [isSending, setIsSending] = useState<boolean>(false);
    let chatMessages: ChatMessage[] = getChatMessages(chat)
    useEffect(() => {
        if (credentialId) {
            let credential: CredentialDetails = selectCredentialById(store.getState(), credentialId)!
            setCredential(credential.verifiableCredential)
        }
        if (presentationId) {
            let presentation: Presentation = selectPresentationById(store.getState(), presentationId)!
            setPresentation(presentation)
        }
    }, [])
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Details" icon="information-outline"
                                       onPress={() => navigation.navigate('ChatView', {chat: chat})}/>
        })
    })
    const renderItem = ({item}: any) => (
        <ChatMessageItem chatMessage={item} navigation={navigation}/>
    );
    return (
        <>
            <FlatList
                inverted
                data={chatMessages}
                removeClippedSubviews={true}
                initialNumToRender={5}
                renderItem={renderItem}
                keyExtractor={(item, index) => String(index)}
            />
            <View style={{
                flexDirection: 'row',
                marginBottom: 8,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center'
            }}>
                <IconButton
                    icon="plus-circle-outline"
                    size={32}
                    onPress={() => console.log('Pressed')}
                />
                {credential ?
                    (<Chip mode={'outlined'} icon="card-account-details-outline" style={{flex: 1}}
                           onClose={() => setCredential(undefined)}
                           onPress={() => console.log('Pressed: ' + credentialId)}>{credential?.id}</Chip>) : presentation ?
                        (<Chip mode={'outlined'} icon="credit-card-scan" style={{flex: 1}}
                               onClose={() => setPresentation(undefined)}
                               onPress={() => console.log('Pressed: ' + presentationId)}>{presentation?.id}</Chip>) :
                        (<TextInput
                            mode={'outlined'}
                            style={{flex: 1, height: 52, backgroundColor: 'white'}}
                            dense={true}
                            placeholder="Message"
                            value={messageText}
                            onChangeText={messageText => setMessageText(messageText)}/>)}
                <IconButton
                    icon={isSending ? (() => <ActivityIndicator animating={true}/>) : "send-circle-outline"}
                    size={32}
                    onPress={async () => {
                        if (!isSending) {
                            setIsSending(true)
                            if (credential) {
                                await issueCredentialMessage.sendIssueCredentialMessage(credential, {
                                    from: chat.yourDID,
                                    to: chat.theirDID,
                                    packingMode: chat.packingMode
                                })
                                setCredential(undefined)
                            } else if (presentation) {
                                await verifierService.sendPresentationRequest(presentation)
                                setPresentation(undefined)
                            } else {
                                await basicMessage.sendBasicMessage(messageText, {
                                    from: chat.yourDID,
                                    to: chat.theirDID,
                                    packingMode: chat.packingMode
                                })
                                setMessageText('')
                            }
                            setIsSending(false)
                        }
                    }}
                />
            </View>
        </>
    );
}
