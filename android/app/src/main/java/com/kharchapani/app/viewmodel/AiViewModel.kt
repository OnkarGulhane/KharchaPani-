package com.kharchapani.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kharchapani.app.data.model.*
import com.kharchapani.app.data.repository.AiRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AiViewModel(
    private val aiRepository: AiRepository
) : ViewModel() {

    // --- Kharcha Guru Chat State ---
    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                role = "assistant",
                content = "नमस्कार! मी तुमचा 'खर्चा Guru' AI फायनान्शियल असिस्टंट आहे. 🤖✨\n\nतुम्ही मला खर्चाचे विश्लेषण, बजेट टिप्स, किंवा बचतीचे मार्ग विचारू शकता!"
            )
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _quickReplies = MutableStateFlow<List<String>>(
        listOf(
            "माझा या महिन्याचा खर्च कसा आहे?",
            "मी पैसे कसे वाचवू?",
            "माझा 50/30/20 बजेट रेशो सांगा",
            "पुढील महिन्यासाठी बजेट प्लॅन द्या"
        )
    )
    val quickReplies: StateFlow<List<String>> = _quickReplies.asStateFlow()

    private val _isChatLoading = MutableStateFlow(false)
    val isChatLoading: StateFlow<Boolean> = _isChatLoading.asStateFlow()

    // --- बोली खर्चा (Voice Expense) State ---
    private val _parsedVoiceExpense = MutableStateFlow<AIQuickParseResponse?>(null)
    val parsedVoiceExpense: StateFlow<AIQuickParseResponse?> = _parsedVoiceExpense.asStateFlow()

    private val _isVoiceParsing = MutableStateFlow(false)
    val isVoiceParsing: StateFlow<Boolean> = _isVoiceParsing.asStateFlow()

    // --- AI Analytics Insights ---
    private val _financialHealth = MutableStateFlow<FinancialHealthResponse?>(null)
    val financialHealth: StateFlow<FinancialHealthResponse?> = _financialHealth.asStateFlow()

    private val _expenseSentiment = MutableStateFlow<ExpenseSentimentResponse?>(null)
    val expenseSentiment: StateFlow<ExpenseSentimentResponse?> = _expenseSentiment.asStateFlow()

    private val _budgetForecast = MutableStateFlow<BudgetForecastResponse?>(null)
    val budgetForecast: StateFlow<BudgetForecastResponse?> = _budgetForecast.asStateFlow()

    private val _isInsightsLoading = MutableStateFlow(false)
    val isInsightsLoading: StateFlow<Boolean> = _isInsightsLoading.asStateFlow()

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMsg = ChatMessage(role = "user", content = text.trim())
        val updatedHistory = _messages.value + userMsg
        _messages.value = updatedHistory

        viewModelScope.launch {
            _isChatLoading.value = true
            val result = aiRepository.askKharchaGuru(
                AIChatRequest(
                    message = text.trim(),
                    history = updatedHistory.dropLast(1)
                )
            )
            _isChatLoading.value = false
            result.fold(
                onSuccess = {
                    val aiMsg = ChatMessage(role = "assistant", content = it.response)
                    _messages.value = _messages.value + aiMsg
                    if (it.quickReplies.isNotEmpty()) {
                        _quickReplies.value = it.quickReplies
                    }
                },
                onFailure = {
                    val errorMsg = ChatMessage(
                        role = "assistant",
                        content = "माफ करा, समस्या उद्भवली: ${it.message ?: "सर्व्हरशी संपर्क साधता आला नाही"}. कृपया पुन्हा प्रयत्न करा. ⚠️"
                    )
                    _messages.value = _messages.value + errorMsg
                }
            )
        }
    }

    fun parseVoiceQuery(text: String, onParsed: (AIQuickParseResponse) -> Unit) {
        if (text.isBlank()) return
        viewModelScope.launch {
            _isVoiceParsing.value = true
            val result = aiRepository.quickParseExpense(text)
            _isVoiceParsing.value = false
            result.onSuccess {
                _parsedVoiceExpense.value = it
                onParsed(it)
            }
        }
    }

    fun clearParsedVoiceExpense() {
        _parsedVoiceExpense.value = null
    }

    fun loadAiInsights() {
        viewModelScope.launch {
            _isInsightsLoading.value = true
            val healthRes = aiRepository.getFinancialHealth().getOrNull()
            val sentimentRes = aiRepository.getExpenseSentiment().getOrNull()
            val forecastRes = aiRepository.getBudgetForecast().getOrNull()

            _financialHealth.value = healthRes
            _expenseSentiment.value = sentimentRes
            _budgetForecast.value = forecastRes
            _isInsightsLoading.value = false
        }
    }
}
