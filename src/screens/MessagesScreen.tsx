import {StyleSheet, Text, View} from "react-native";
import {Avatar, Divider, FAB, List} from "react-native-paper";
import * as React from "react";
import {useSelector} from "react-redux";
import {selectAllChats} from "../redux/reducers/chatsSlice";
import Chat from "../models/Chat";
import IdentifierDetails from "../models/IdentifierDetails";
import {selectIdentifierDetailById} from "../redux/reducers/identifierDetailsSlice";
import {RootState} from "../redux/reducers/rootReducer";

export const MessagesScreen = ({navigation}: { navigation: any }) => {
    const chats: Chat[] = useSelector(selectAllChats)
    const MessagesTable = () => <View>
        {chats.map((chat: Chat) => {
            const theirDID: IdentifierDetails | undefined = useSelector((state: RootState) => selectIdentifierDetailById(state, chat.theirDID))
            return (
                <View key={chat.id}><List.Item
                    title={theirDID?.name?.substring(0, 30) ?? chat.theirDID?.substring(0, 30)}
                    description={chat.lastMessage?.type ?? 'Unknown message type'}
                    descriptionNumberOfLines={1}
                    onPress={() => navigation.navigate('ChatMessages', {chatId: chat.id})}
                    right={() => <View style={{flexDirection: 'row', height: 24}}>
                        {chat.lastMessage?.created_time ?
                            <Text style={{
                                marginRight: 8,
                                marginLeft: 4,
                                alignSelf: 'center'
                            }}>{new Date(parseInt(chat.lastMessage?.created_time) * 1000).toUTCString().substring(0, 7)}</Text> : <></>}
                    </View>}
                    left={() => <Avatar.Icon size={50} icon="account"/>}/><Divider/></View>
            )
        })}
    </View>
    return (<><MessagesTable/>
        <FAB
            style={styles.fab}
            icon="plus"
            label="New chat"
            onPress={async () => {
                navigation.navigate('ChatNew')
            }}/></>);
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})
