package com.mobileapp.bluetooth

abstract class Message {
    open var message: String = ""
    var messageTimer: MessageTimer? = null
    var messagePacketTimer: MessageTimer? = null
}
