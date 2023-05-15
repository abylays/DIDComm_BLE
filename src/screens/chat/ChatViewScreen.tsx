import * as React from 'react';
import {useEffect, useLayoutEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {List} from "react-native-paper";
import DropDown from "react-native-paper-dropdown";
import {deleteChat, updateChat} from "../../redux/reducers/chatsSlice";
import {useDispatch} from "react-redux";
import Chat from "../../models/Chat";
import store from "../../redux/store/Store";
import {trustPing} from "../../protocols/Protocols";
import {Header} from "../../components/Header";
import {DIDCommMessagePacking} from "@veramo/did-comm";

export const ChatViewScreen = ({route, navigation}: { route: any, navigation: any }) => {
    const chat: Chat = route.params.chat;

    let dispatch = useDispatch()
    const [showDropDown, setShowDropDown] = useState(false);
    const [packingMode, setPackingMode] = useState(chat.packingMode);
    const packingModeList = [
        {
            label: "None",
            value: "none",
        },
        {
            label: "Authcrypt",
            value: "authcrypt",
        },
        {
            label: "Anoncrypt",
            value: "anoncrypt",
        },
    ];
    const updatePackingMode = (value: DIDCommMessagePacking) => {
        store.dispatch(updateChat({
            id: chat.id,
            changes: {packingMode: value},
        }))
    }
    useEffect(() => {
        updatePackingMode(packingMode)
    })
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <Header title="Delete chat" icon="delete-outline" onPress={async () => {
                dispatch(deleteChat(chat.id))
                console.log('Deleted chat: ' + chat.id)
                navigation.pop(2)
            }}/>
        })
    })
    return (<ScrollView>
        <List.Item
            title="Your DID"
            description={chat.yourDID}
        />
        <List.Item
            title="Their DID"
            description={chat.theirDID}
        />
        <List.Item
            title="Go to connection"
            onPress={() => {
                navigation.navigate('ConnectionView', {connectionId: chat.connection?.id});
            }}
            right={props => <List.Icon {...props} icon="arrow-right"/>}/>
        <List.Item
            title="Send a ping message"
            onPress={() => {
                trustPing.sendPing(chat.yourDID, chat.theirDID)
            }}
            right={props => <List.Icon {...props} icon="arrow-right"/>}/>
        <View style={{margin: 8}}>
            <DropDown
                label={"Message encryption"}
                mode={"outlined"}
                visible={showDropDown}
                showDropDown={() => setShowDropDown(true)}
                onDismiss={() => setShowDropDown(false)}
                value={packingMode}
                setValue={setPackingMode}
                list={packingModeList}
            />
        </View>
    </ScrollView>);
}
