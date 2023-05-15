package com.mobileapp.bluetooth

import android.util.Log
import com.facebook.react.bridge.Promise
import java.nio.charset.Charset
import java.nio.charset.StandardCharsets
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue

class MessageSender(
    override var message: String = "",
    private var promise: Promise,
    private var sendData: ((data: ByteArray) -> Unit)
) : Message() {

    private val tag = "MessageSender"
    private val messagePacketQueue: Queue<String> = ConcurrentLinkedQueue()

    fun send(mtu: Int) {
        messageTimer = MessageTimer()
        messagePacketTimer = MessageTimer()
        messageTimer?.start(SEND_MESSAGE_TIMEOUT, {
            sendMessageFailed()
        }, true)
        addMessageToQueue(mtu)
        sendNextMessagePacket(sendData)
    }

    fun sendNextMessagePacket(sendData: (data: ByteArray) -> Unit) {
        messagePacketTimer?.stop(true)
        if (messagePacketQueue.isEmpty()) {
            sentMessage()
        } else {
            sendMessagePacket(sendData)
        }
    }

    private fun sendMessagePacket(sendData: (data: ByteArray) -> Unit) {
        val messageToSend = messagePacketQueue.peek()
        Log.d(
            tag, "Sending message packet: $messageToSend, BYTES = ${
                messageToSend?.toByteArray(
                    StandardCharsets.UTF_8
                )?.size
            }"
        )
        messagePacketTimer?.start(SEND_MESSAGE_PACKET_TIMEOUT, {
            sendMessagePacketFailed()
        }, true)
        messagePacketQueue.poll()?.toByteArray(Charset.forName("UTF-8"))?.let { sendData.invoke(it) }
    }

    private fun sentMessage() {
        messageTimer?.stop(true)
        Log.d(
            tag, "Fully sent message = ${message}, BYTES = ${
                message.toByteArray(
                    StandardCharsets.UTF_8
                ).size
            }"
        )
        promise.resolve(message)
    }

    private fun sendMessageFailed() {
        promise.reject(Throwable("Failed to send message due to timeout! Max threshold = $SEND_MESSAGE_TIMEOUT millis"))
        Log.d(tag, "Failed to send message due to timeout! Max threshold = $SEND_MESSAGE_TIMEOUT millis")
    }

    private fun sendMessagePacketFailed() {
        promise.reject(Throwable("Failed to send message packet due to timeout! Max threshold = $SEND_MESSAGE_PACKET_TIMEOUT millis"))
        Log.d(
            tag,
            "Failed to send message packet due to timeout! Max threshold = $SEND_MESSAGE_PACKET_TIMEOUT millis"
        )
    }

    private fun addMessageToQueue(mtu: Int) {
        var data = message
        while (data.length > mtu) {
            messagePacketQueue.add(data.substring(0, mtu))
            data = data.substring(mtu)
        }
        messagePacketQueue.add(data)
        messagePacketQueue.add("EOM") // message delimiter
    }
}
