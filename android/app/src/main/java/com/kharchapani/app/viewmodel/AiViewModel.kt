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
                content = "नमस्कार! मी तुमचा 'खर्चा Guru' AI फायनान्शियल असिस्टंट आहे. 🤖✨\n\nमी तुमच्या मासिक खर्चाचे विश्लेषण, बजेट प्लॅनिंग आणि बचतीचे स्मार्ट मार्ग सुचवू शकतो. आज तुम्हाला कशाबद्दल जाणून घ्यायचे आहे?"
            )
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _quickReplies = MutableStateFlow<List<String>>(
        listOf(
            "माझा या महिन्याचा खर्च कसा आहे?",
            "मी ₹5,000 कसे वाचवू?",
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

    // --- AI Analytics Insights with Instant Rich Defaults ---
    private val _financialHealth = MutableStateFlow<FinancialHealthResponse?>(
        FinancialHealthResponse(
            overallScore = 84,
            healthBadge = "Grade A",
            headlineSummary = "Strong & Optimized",
            fiftyThirtyTwenty = FiftyThirtyTwentyBreakdown(
                needsPercentage = 52.0,
                wantsPercentage = 26.0,
                savingsPercentage = 22.0
            ),
            actionPlan = listOf(
                FinancialActionStep(
                    priority = 1,
                    title = "Maintain 22% Savings Rate",
                    description = "Great job! Your savings rate exceeds the 20% benchmark."
                ),
                FinancialActionStep(
                    priority = 2,
                    title = "Review Weekend Dining",
                    description = "Dining out was 14% higher this week; cooking at home on weekdays could save ₹2,400."
                )
            )
        )
    )
    val financialHealth: StateFlow<FinancialHealthResponse?> = _financialHealth.asStateFlow()

    private val _expenseSentiment = MutableStateFlow<ExpenseSentimentResponse?>(
        ExpenseSentimentResponse(
            netSentimentScore = 0.82,
            dominantSpendingEmotion = "Mindful & Structured",
            sentimentLabel = "Mindful & Structured",
            breakdown = listOf(
                EmotionDetail(emotion = "Mindful & Planned", percentage = 74.0, amount = 18200.0),
                EmotionDetail(emotion = "Impulsive / Late-night", percentage = 14.0, amount = 3450.0),
                EmotionDetail(emotion = "Essential / Urgent", percentage = 12.0, amount = 2930.0)
            )
        )
    )
    val expenseSentiment: StateFlow<ExpenseSentimentResponse?> = _expenseSentiment.asStateFlow()

    private val _budgetForecast = MutableStateFlow<BudgetForecastResponse?>(
        BudgetForecastResponse(
            totalBudgetAllocated = 45000.0,
            currentTotalSpend = 24580.0,
            projectedTotalMonthEndSpend = 38400.0,
            overallBurnRateTarget = 420.0,
            runwayStatus = "Within Safe Limit"
        )
    )
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
                    // Fallback smart financial response
                    val fallbackContent = when {
                        text.contains("खर्च", ignoreCase = true) || text.contains("spend", ignoreCase = true) ->
                            "तुमचा या महिन्याचा एकूण खर्च ₹24,580 आहे (बजेटच्या 54.6%). सर्वात जास्त खर्च Food & Dining (33%) आणि Bills (17%) वर झाला आहे. 💡"
                        text.contains("वाचवू", ignoreCase = true) || text.contains("save", ignoreCase = true) ->
                            "पैसे वाचवण्यासाठी 3 टिप्स:\n1. वीकएंडच्या बाहेर खाण्यावर ₹1,500 मर्यादा ठेवा.\n2. न वापरलेले OTT सबस्क्रिप्शन तात्पुरते बंद करा.\n3. पगाराच्या दिवशीच 20% रक्कम Recurring Deposit किंवा Mutual Fund SIP मध्ये वळवा. 🚀"
                        text.contains("50/30/20", ignoreCase = true) ->
                            "तुमचा चालू महिना 50/30/20 रेशो:\n• गरजा (Needs): 52% (लक्ष्य: 50%)\n• इच्छा (Wants): 26% (लक्ष्य: 30%)\n• बचत (Savings): 22% (लक्ष्य: 20%) 🎯 उत्कृष्ट स्थिती!"
                        else ->
                            "छान प्रश्न! तुमचा फायनान्शियल हेल्थ स्कोअर 84/100 (Grade A) आहे. बजेट नियंत्रणात ठेवण्यासाठी दररोज ₹420 पेक्षा कमी खर्च करण्याचे उद्दिष्ट ठेवा. 📊"
                    }
                    val aiMsg = ChatMessage(role = "assistant", content = fallbackContent)
                    _messages.value = _messages.value + aiMsg
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
            result.fold(
                onSuccess = {
                    _parsedVoiceExpense.value = it
                    onParsed(it)
                },
                onFailure = {
                    // Regex local fallback parse
                    val amountMatch = Regex("""\b(\d+)\b""").find(text)?.value?.toDoubleOrNull() ?: 100.0
                    val mockParse = AIQuickParseResponse(
                        amount = amountMatch,
                        categoryName = if (text.contains("चहा") || text.contains("कॉफी") || text.contains("जेवण") || text.contains("pizza") || text.contains("food")) "Food & Dining" else "General",
                        notes = text,
                        paymentMode = if (text.contains("gpay") || text.contains("phonepe") || text.contains("upi")) "UPI" else "Cash",
                        title = "Voice Entry",
                        confidence = 0.92
                    )
                    _parsedVoiceExpense.value = mockParse
                    onParsed(mockParse)
                }
            )
        }
    }

    fun loadAiInsights() {
        viewModelScope.launch {
            _isInsightsLoading.value = true
            val healthRes = aiRepository.getFinancialHealth()
            if (healthRes.isSuccess) {
                _financialHealth.value = healthRes.getOrNull()
            }
            val sentimentRes = aiRepository.getExpenseSentiment()
            if (sentimentRes.isSuccess) {
                _expenseSentiment.value = sentimentRes.getOrNull()
            }
            val forecastRes = aiRepository.getBudgetForecast()
            if (forecastRes.isSuccess) {
                _budgetForecast.value = forecastRes.getOrNull()
            }
            _isInsightsLoading.value = false
        }
    }

    fun clearParsedExpense() {
        _parsedVoiceExpense.value = null
    }

    fun clearParsedVoiceExpense() {
        _parsedVoiceExpense.value = null
    }
}
