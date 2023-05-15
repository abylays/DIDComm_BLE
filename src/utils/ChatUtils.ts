import Chat from "../models/Chat";
import {addChat, selectChatById, updateChat} from "../redux/reducers/chatsSlice";
import store from "../redux/store/Store";
import MessageDetails from "../models/MessageDetails";
import ConnectionDetails from "../models/ConnectionDetails";
import {selectAllConnection, selectConnectionById} from "../redux/reducers/connectionsSlice";
import {ChatMessage} from "../screens/chat/ChatMessagesScreen";
import {IDIDCommMessage} from "@veramo/did-comm";

/**
 * Get chat using your DID and their DID. If chat does not exist, then a new one is created. It also checks if an existing connection can be used for this chat.
 * @param yourDID Your DID
 * @param theirDID Their DID
 * @return A chat object {@link Chat}
 */
export const getChat = (yourDID: string, theirDID: string): Chat => {
    let chatId = yourDID + theirDID
    let chat: Chat | undefined = selectChatById(store.getState(), chatId)
    if (chat == null) { // Start new chat if not found
        chat = {
            id: yourDID + theirDID,
            yourDID: yourDID,
            theirDID: theirDID,
            yourMessages: [],
            theirMessages: [],
            connection: undefined,
            packingMode: 'authcrypt' // Encrypted by default
        }
        store.dispatch(addChat(chat))
        console.log('Chat (' + chat.id + '): New chat created')
    } else {
        console.log('Chat (' + chat.id + '): Existing chat found')
    }

    // Check if connection exits for this chat
    if (chat.connection == null) {
        const connection: ConnectionDetails | undefined = getConnection(chat.yourDID, chat.theirDID)
        if (connection) {
            store.dispatch(updateChat({
                id: chat.id,
                changes: {connection: connection},
            }))
            console.log('Chat (' + chat.id + '): Connection is set')
        } else {
            console.log('Chat (' + chat.id + '): No connection is set')
        }
    } else {
        let connection: ConnectionDetails | undefined = selectConnectionById(store.getState(), chat.connection.id)
        if (!connection) {
            store.dispatch(updateChat({
                id: chat.id,
                changes: {connection: undefined},
            }))
            console.log('Chat (' + chat.id + '): Connection has been removed')
        }
    }
    return chat
}
export const getConnection = (yourDID: string, theirDID: string): ConnectionDetails | undefined => {
    const connectionDetails: ConnectionDetails[] = selectAllConnection(store.getState())
    for (let connection of connectionDetails) {
        if (connection.yourDID === yourDID && connection.theirDID === theirDID) {
            return connection
        }
    }
}
export const getChatMessages = (chat: Chat): ChatMessage[] => {
    // Generate chat messages list and sort it by created date
    let chatMessages: ChatMessage[] = []
    chat?.yourMessages.forEach(message => {
        chatMessages.push({isTheirs: false, message: message, chatId: chat.id})
    })
    chat?.theirMessages.forEach(message => {
        chatMessages.push({isTheirs: true, message: message, chatId: chat.id})
    })
    chatMessages.sort((a, b) => {
        if (a.message.created_time && b.message.created_time) {
            return parseInt(b.message.created_time) - parseInt(a.message.created_time)
        } else {
            return -1
        }
    })
    return chatMessages
}
export const addYourMessageToChat = (chat: Chat, yourMessage: MessageDetails) => {
    let yourMessages: MessageDetails[] = [...chat.yourMessages]
    yourMessages.push(yourMessage)
    store.dispatch(updateChat({
        id: chat.id,
        changes: {yourMessages: yourMessages, lastMessage: yourMessage},
    }))
    console.log('Chat (' + chat.id + '): Saved your message (' + yourMessage.id + ')')
}
export const addTheirMessageToChat = (chat: Chat, theirMessage: MessageDetails) => {
    let theirMessages: MessageDetails[] = [...chat.theirMessages]
    theirMessages.push(theirMessage)
    store.dispatch(updateChat({
        id: chat.id,
        changes: {theirMessages: theirMessages, lastMessage: theirMessage},
    }))
    console.log('Chat (' + chat.id + '): Saved their message (' + theirMessage.id + ')')
}

export const deleteMessageFromChat = (chatMessage: ChatMessage) => {
    const chat: Chat | undefined = selectChatById(store.getState(), chatMessage.chatId)
    if (chat) {
        if (!chatMessage.isTheirs) {
            let yourMessages: IDIDCommMessage[] = [...chat.yourMessages]
            let index = yourMessages.indexOf(yourMessages.find(x => x.id === chatMessage.message.id)!);
            if (index !== -1) {
                yourMessages.splice(index, 1);
            }
            store.dispatch(updateChat({
                id: chatMessage.chatId,
                changes: {yourMessages: yourMessages},
            }))
            console.log('Message is removed from your chat: ' + chatMessage.message.id)
        } else if (chatMessage.isTheirs) {
            let theirMessages: IDIDCommMessage[] = [...chat.theirMessages]
            let index = theirMessages.indexOf(theirMessages.find(x => x.id === chatMessage.message.id)!);
            if (index !== -1) {
                theirMessages.splice(index, 1);
            }
            store.dispatch(updateChat({
                id: chatMessage.chatId,
                changes: {theirMessages: theirMessages},
            }))
            console.log('Message is removed from their chat: ' + chatMessage.message.id)
        }
    }
}
