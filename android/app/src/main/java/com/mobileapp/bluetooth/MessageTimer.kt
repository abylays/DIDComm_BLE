package com.mobileapp.bluetooth

import android.util.Log
import java.util.*
import java.util.concurrent.TimeUnit
import kotlin.concurrent.schedule

class MessageTimer {

    private val logTag = "MessageTimer"
    private var timer: Timer? = null
    private var beginTime: Long = 0
    private var endTime: Long = 0

    fun start(timeoutInMillis: Long, onTimeoutCallback: () -> Unit, print: Boolean?) {
        timer = Timer()
        timer?.schedule(timeoutInMillis) {
            onTimeoutCallback.invoke()
        }
        beginTime = System.nanoTime()
        if (print == true) {
            Log.d(
                logTag,
                "MessageTimer started"
            )
        }
    }

    fun stop(print: Boolean?) {
        endTime = System.nanoTime()
        if (timer != null) {
            timer?.cancel()
        }
        if (print == true) {
            printElapsedTime()
        }
    }

    private fun printElapsedTime() {
        if (endTime > 0 && beginTime > 0) {
            val elapsedTimeNanoseconds = endTime - beginTime
            val elapsedTimeMilliseconds = TimeUnit.NANOSECONDS.toMillis(elapsedTimeNanoseconds)
            Log.d(
                logTag,
                "MessageTimer stopped: Elapsed time in milliseconds = ${elapsedTimeMilliseconds}"
            )
        }
    }

}
