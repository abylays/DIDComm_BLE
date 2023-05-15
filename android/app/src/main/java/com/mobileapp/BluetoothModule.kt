package com.mobileapp

import android.os.Build
import androidx.annotation.Nullable
import androidx.annotation.RequiresApi
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.mobileapp.bluetooth.BluetoothClient
import com.mobileapp.bluetooth.BluetoothServer
import java.util.*


class BluetoothModule(val context: ReactApplicationContext) : ReactContextBaseJavaModule() {

    override fun getName(): String {
        return "BluetoothModule"
    }

    companion object {
        fun sendArrayEvent(reactContext: ReactContext, eventName: String, @Nullable params: WritableArray) {
            reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, params)
        }

        fun sendMapEvent(reactContext: ReactContext, eventName: String, @Nullable params: WritableMap?) {
            reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, params)
        }

        fun sendMessageEvent(reactContext: ReactContext, eventName: String, @Nullable message: String) {
            reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit(eventName, message)
        }
    }

    @ReactMethod
    private fun initServer(pairing: Boolean, promise: Promise) {
        BluetoothServer.init(context, pairing)
        promise.resolve(true);
    }

    @ReactMethod
    private fun startServer(serviceUuid: String, promise: Promise) {
        BluetoothServer.startServer(UUID.fromString(serviceUuid))
        promise.resolve(true);
    }

    @ReactMethod
    private fun stopServer(promise: Promise) {
        BluetoothServer.stopServer()
        promise.resolve(true);
    }

    @ReactMethod
    private fun disconnectServerDevice(deviceAddress: String, promise: Promise) {
        BluetoothServer.disconnectDevice(deviceAddress)
        promise.resolve(true);
    }

    @ReactMethod
    private fun pairServerDevice(deviceAddress: String, promise: Promise) {
        return promise.resolve(BluetoothServer.pairDevice(deviceAddress))
    }

    @ReactMethod
    private fun sendServerMessage(message: String, promise: Promise) {
        BluetoothServer.sendMessage(message, promise)
    }

    @ReactMethod
    private fun initClient(promise: Promise) {
        BluetoothClient.init(context)
        promise.resolve(true);
    }

    @ReactMethod
    private fun startScan(promise: Promise) {
        val result = BluetoothClient.startScan()
        promise.resolve(result);
    }

    @ReactMethod
    private fun stopScan(promise: Promise) {
        BluetoothClient.stopScan()
        promise.resolve(true);
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @ReactMethod
    private fun connectDevice(deviceAddress: String, promise: Promise) {
        BluetoothClient.connectDevice(deviceAddress)
        promise.resolve(true);
    }

    @ReactMethod
    private fun disconnectClientDevice(deviceAddress: String, promise: Promise) {
        BluetoothClient.disconnectDevice(deviceAddress)
        promise.resolve(true);
    }

    @ReactMethod
    private fun pairClientDevice(deviceAddress: String, promise: Promise) {
        return promise.resolve(BluetoothClient.pairDevice(deviceAddress))
    }

    @ReactMethod
    private fun sendClientMessage(message: String, promise: Promise) {
        BluetoothClient.sendMessage(message, promise)
    }
}
