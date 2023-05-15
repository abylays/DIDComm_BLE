package com.mobileapp.bluetooth

import com.facebook.react.bridge.Promise

class MessageManager(
    private val onReceivedMessage: (message: String) -> Unit,
    private val sendData: (data: ByteArray) -> Unit
) {
    private val tag = "MessageManager"

    var mtu: Int = 20
    private var sendingMessage: MessageSender? = null
    private var receiveMessage: MessageReceiver? = null

    fun sendMessage(message: String, promise: Promise) {
        sendingMessage = MessageSender(message, promise, sendData)
        sendingMessage?.send(mtu)
    }

    fun sendNextMessagePacket() {
        sendingMessage?.sendNextMessagePacket(sendData)
    }

    fun handleMessagePacket(messagePacket: String) {
        if (receiveMessage != null) {
            if (messagePacket == "EOM") {
                receiveMessage?.receivedMessage()
                receiveMessage = null
            } else {
                receiveMessage?.receivedMessagePacket(messagePacket)
            }
        } else {
            receiveMessage = MessageReceiver(onReceivedMessage)
            receiveMessage?.startReceive(messagePacket)
        }
    }
}
