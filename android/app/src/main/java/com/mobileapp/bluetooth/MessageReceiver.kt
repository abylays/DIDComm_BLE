package com.mobileapp.bluetooth

import android.util.Log
import java.nio.charset.StandardCharsets

class MessageReceiver(
    private val onReceivedMessage: (message: String) -> Unit
) : Message() {

    private val tag = "MessageReceiver"

    fun receivedMessagePacket(messagePacket: String) {
        messagePacketTimer?.stop(true)
        messagePacketTimer?.start(RECEIVE_MESSAGE_PACKET_TIMEOUT, {
            receivedMessagePacketFailed()
        }, true)
        message = message.plus(messagePacket)
    }

    fun startReceive(messagePacket: String) {
        message = messagePacket
        messageTimer = MessageTimer()
        messagePacketTimer = MessageTimer()
        messageTimer?.start(RECEIVE_MESSAGE_TIMEOUT, {
            receivedMessageFailed()
        }, true)
        messagePacketTimer?.start(RECEIVE_MESSAGE_PACKET_TIMEOUT, {
            receivedMessagePacketFailed()
        }, true)
    }

    fun receivedMessage() {
        messagePacketTimer?.stop(true)
        messageTimer?.stop(true)
        Log.d(
            tag, "Fully received message = ${message}, Bytes = ${
                message.toByteArray(
                    StandardCharsets.UTF_8
                ).size
            }"
        )
        message.let { onReceivedMessage.invoke(it) }
    }

    private fun receivedMessagePacketFailed() {
        Log.d(
            tag,
            "Failed to receive message packet due to timeout! Max threshold = $RECEIVE_MESSAGE_PACKET_TIMEOUT millis"
        )
    }

    private fun receivedMessageFailed() {
        Log.d(tag, "Failed to receive message due to timeout! Max threshold = $RECEIVE_MESSAGE_TIMEOUT millis")
    }

}
