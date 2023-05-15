import {Avatar, Card, Divider, Paragraph, Text} from "react-native-paper";
import * as React from "react";
import {StyleSheet, View} from "react-native";
import {ChatMessage} from "./ChatMessagesScreen";
import {v4 as uuidv4} from "uuid";
import {getDisplayName} from "../../utils/AgentUtils";

export const ChatMessageItem = React.memo(({
                                               navigation,
                                               chatMessage
                                           }: { navigation: any, chatMessage: ChatMessage }) => {
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="account"/>
    const EncryptionIcon = (chatMessage: ChatMessage) => {
        if (chatMessage.message.packingMode != 'none') {
            return (<Avatar.Icon size={24} style={{backgroundColor: '#FFFFFF', marginRight: 8}} color='#18A73E'
                                 icon="lock-outline"/>)
        } else {
            return (<Avatar.Icon size={24} style={{backgroundColor: '#FFFFFF', marginRight: 8}} color='#F83434'
                                 icon="lock-open-outline"/>)
        }

    }
    return (
        <Card key={uuidv4()} style={chatMessage.isTheirs ? styles.cardContainerTheirs : styles.cardContainerYours}
              onPress={() => {
                  navigation.navigate('ChatMessageView', {chatMessage: chatMessage})
              }}>
            <Card.Title title={getDisplayName(chatMessage.message.from)} titleStyle={{fontSize: 16}}
                        subtitle={chatMessage.message.from}
                        left={LeftContent}
                        right={(props) => <View style={{flexDirection: 'row'}}>
                            {chatMessage.message.created_time ?
                                <Text {...props}>{new Date(parseInt(chatMessage.message.created_time) * 1000).toUTCString().substring(0, 7)}</Text> : <></>
                            }
                            <Divider style={{width: 1, height: '100%', marginLeft: 8, marginRight: 8}}/>
                            {EncryptionIcon(chatMessage)}
                        </View>}/>
            <Card.Content>
                <Paragraph>{JSON.stringify(chatMessage.message.body)}</Paragraph>
            </Card.Content>
        </Card>
    )
})

const styles = StyleSheet.create({
    cardContainerTheirs: {
        marginLeft: 8,
        marginTop: 8,
        marginRight: 80,
        marginBottom: 8
    },
    cardContainerYours: {
        marginLeft: 80,
        marginTop: 8,
        marginRight: 8,
        marginBottom: 8
    }
})
