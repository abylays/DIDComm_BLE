package com.mobileapp.bluetooth

import java.util.*

val DIDCOMM_SERVICE_UUID: UUID = UUID.fromString("d2f195b6-2e80-4ab0-be24-32ebe761352f")

val CLIENT_CONFIGURATION_DESCRIPTOR_UUID: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

val READ_MESSAGE_UUID: UUID = UUID.fromString("e6e97879-780a-4c9b-b4e6-dcae3793a3e8")

val WRITE_MESSAGE_UUID: UUID = UUID.fromString("c3103ded-afd7-477c-b279-2ad264e20e74")

const val SEND_MESSAGE_TIMEOUT = 180000L
const val SEND_MESSAGE_PACKET_TIMEOUT = 10000L
const val RECEIVE_MESSAGE_TIMEOUT = 180000L
const val RECEIVE_MESSAGE_PACKET_TIMEOUT = 10000L