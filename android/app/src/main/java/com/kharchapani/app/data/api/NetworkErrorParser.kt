package com.kharchapani.app.data.api

import com.google.gson.JsonParser
import retrofit2.HttpException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

object NetworkErrorParser {
    fun parse(e: Throwable): String {
        return when (e) {
            is HttpException -> {
                val errorBody = try {
                    e.response()?.errorBody()?.string()
                } catch (_: Exception) {
                    null
                }

                if (!errorBody.isNullOrBlank()) {
                    try {
                        val parsed = JsonParser.parseString(errorBody)
                        if (parsed.isJsonObject) {
                            val json = parsed.asJsonObject
                            if (json.has("detail") && !json.get("detail").isJsonNull) {
                                val detailElem = json.get("detail")
                                if (detailElem.isJsonPrimitive) {
                                    return detailElem.asString
                                } else if (detailElem.isJsonArray) {
                                    val arr = detailElem.asJsonArray
                                    if (arr.size() > 0 && arr[0].isJsonObject) {
                                        val firstObj = arr[0].asJsonObject
                                        if (firstObj.has("msg")) {
                                            return firstObj.get("msg").asString
                                        }
                                    }
                                }
                            }
                            if (json.has("message") && !json.get("message").isJsonNull) {
                                return json.get("message").asString
                            }
                            if (json.has("error") && !json.get("error").isJsonNull) {
                                return json.get("error").asString
                            }
                        }
                    } catch (_: Exception) {}
                }

                when (e.code()) {
                    400 -> "Invalid request. An account with this email may already exist or input is invalid."
                    401 -> "Invalid email or password. Please try again."
                    403 -> "Account is unverified or forbidden. Please contact support."
                    404 -> "Requested resource not found on server."
                    422 -> "Validation error. Ensure email is valid and password has at least 8 characters."
                    500 -> "Server error occurred. Please check backend."
                    else -> "Network error (${e.code()}): ${e.message()}"
                }
            }
            is ConnectException -> "Cannot connect to backend server at this IP. Check Wi-Fi connection."
            is SocketTimeoutException -> "Server connection timed out. Please retry."
            is UnknownHostException -> "Server host unreachable. Please verify server IP."
            else -> e.localizedMessage ?: e.message ?: "An unexpected error occurred"
        }
    }
}
