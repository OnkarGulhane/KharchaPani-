package com.kharchapani.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import com.kharchapani.app.KharchaPaniApp
import com.kharchapani.app.data.model.ExpenseCreate
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.regex.Pattern

class BankSmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.originatingAddress ?: ""
                val messageBody = sms.messageBody ?: ""
                Log.d("BankSmsReceiver", "SMS from $sender: $messageBody")

                parseAndRecordBankExpense(sender, messageBody)
            }
        }
    }

    private fun parseAndRecordBankExpense(sender: String, body: String) {
        val lowerBody = body.lowercase()

        // Check if message is a debit / expense transaction
        val isDebit = lowerBody.contains("debited") ||
                lowerBody.contains("spent") ||
                lowerBody.contains("sent") ||
                lowerBody.contains("paid") ||
                lowerBody.contains("withdrawn")

        if (!isDebit) return

        // 1. Extract Amount (matches Rs. 500, Rs 500.00, INR 1,250.50, etc.)
        val amountPattern = Pattern.compile("(?:rs\\.?|inr|₹)\\s*([0-9,]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE)
        val amountMatcher = amountPattern.matcher(body)

        val amount = if (amountMatcher.find()) {
            amountMatcher.group(1)?.replace(",", "")?.toDoubleOrNull()
        } else null

        if (amount == null || amount <= 0.0) return

        // 2. Extract Merchant / VPA / Info
        var description = "Bank Auto-Debit"
        val merchantPattern = Pattern.compile("(?:to|at|vpa|info)\\s+([A-Za-z0-9_@.\\-\\s]{3,25})", Pattern.CASE_INSENSITIVE)
        val merchantMatcher = merchantPattern.matcher(body)
        if (merchantMatcher.find()) {
            merchantMatcher.group(1)?.trim()?.let {
                description = "Paid to $it"
            }
        }

        // 3. Record transaction if user is logged in
        try {
            val app = KharchaPaniApp.instance
            if (app.sessionManager.getAccessToken() != null) {
                CoroutineScope(Dispatchers.IO).launch {
                    val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())
                    val defaultCatId = app.expenseRepository.getCategories().getOrNull()?.firstOrNull()?.id ?: 1
                    app.expenseRepository.createExpense(
                        ExpenseCreate(
                            title = description,
                            amount = amount,
                            date = today,
                            categoryId = defaultCatId,
                            paymentMode = if (lowerBody.contains("upi")) "UPI" else "Bank Transfer",
                            notes = description
                        )
                    )
                    Log.i("BankSmsReceiver", "Successfully auto-recorded ₹$amount from SMS: $description")
                }
            }
        } catch (e: Exception) {
            Log.e("BankSmsReceiver", "Could not auto-record expense: ${e.message}")
        }
    }
}
