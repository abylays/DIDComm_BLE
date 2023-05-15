import * as React from 'react';
import {useLayoutEffect} from 'react';
import {ScrollView} from 'react-native';
import {List} from "react-native-paper";
import {ChatMessage} from "./ChatMessagesScreen";
import {deleteMessageFromChat} from "../../utils/ChatUtils";
import {Header} from "../../components/Header";

export const ChatMessageViewScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const chatMessage: ChatMessage = route.params.chatMessage;
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Delete message" icon="delete-outline" onPress={async () => {
                deleteMessageFromChat(chatMessage)
                navigation.goBack()
            }}/>
        })
    })
    const MessageFields = () => (
        <List.Section>
            <List.Item
                title="Message type"
                description={chatMessage.message.type}
            />
            <List.Item
                title="Message encryption"
                description={chatMessage.message.packingMode}
            />
            <List.Item
                title="Message id"
                description={chatMessage.message.id}
            />
            <List.Item
                title="Message thid"
                description={chatMessage.message.thid}
            />
            <List.Item
                title="Message pthid"
                description={chatMessage.message.pthid}
            />
            <List.Item
                title="Message to"
                description={chatMessage.message.to}
            />
            <List.Item
                title="Message from"
                description={chatMessage.message.from}
            />
            <List.Item
                title="Message created"
                description={chatMessage.message.created_time}
            />
            <List.Item
                title="Message expires"
                description={chatMessage.message.expires_time}
            />
            <List.Item
                title="Message body"
                description={JSON.stringify(chatMessage.message.body)}
                descriptionNumberOfLines={20}
            />
            <List.Item
                title="Message attachments"
                description={JSON.stringify(chatMessage.message.attachments)}
                descriptionNumberOfLines={20}
            />
            <List.Item
                title="Message raw"
                description={JSON.stringify(chatMessage.message)}
                descriptionNumberOfLines={50}
            />
        </List.Section>
    );
    return (<ScrollView><MessageFields/></ScrollView>);
}
