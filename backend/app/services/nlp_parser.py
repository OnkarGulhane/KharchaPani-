import re
from datetime import date, timedelta
from decimal import Decimal
from typing import List, Optional, Tuple
from app.schemas.category import CategoryResponse
from app.schemas.ai import AIQuickParseResponse


class LocalNLPParser:
    """Intelligent Local Rule-Based NLP & Semantic Parser for Expense Sentences.
    
    Supports English, Hinglish, and Marathi phrases with zero external dependencies.
    """

    PAYMENT_MODES = {
        "upi": "UPI",
        "gpay": "UPI",
        "googlepay": "UPI",
        "google pay": "UPI",
        "phonepe": "UPI",
        "phone pe": "UPI",
        "paytm": "UPI",
        "bhim": "UPI",
        "cred": "UPI",
        "cash": "Cash",
        "rokh": "Cash",
        "rokad": "Cash",
        "nagad": "Cash",
        "card": "Card",
        "debit": "Card",
        "credit": "Card",
        "visa": "Card",
        "mastercard": "Card",
        "amex": "Card",
        "netbanking": "Net Banking",
        "net banking": "Net Banking",
        "bank transfer": "Net Banking",
        "neft": "Net Banking",
        "rtgs": "Net Banking",
        "imps": "Net Banking",
        "wallet": "Wallet",
    }

    CATEGORY_KEYWORDS = {
        "food": [
            "food", "grocery", "groceries", "swiggy", "zomato", "restaurant", "hotel", "cafe",
            "coffee", "tea", "chai", "lunch", "dinner", "breakfast", "nashta", "snacks",
            "pizza", "burger", "dmart", "d-mart", "blinkit", "zepto", "instamart", "bigbasket",
            "milk", "vegetables", "fruits", "mcdonalds", "starbucks", "bhaji", "kirana", "paneer",
            "egg", "eggs", "chicken", "sweets", "mithai"
        ],
        "transport": [
            "transport", "travel", "uber", "ola", "auto", "rickshaw", "cab", "taxi", "petrol",
            "diesel", "fuel", "cng", "bus", "train", "metro", "flight", "airfare", "toll",
            "parking", "rapido", "ticket", "local", "fastag"
        ],
        "utilities": [
            "utilities", "utility", "bill", "electricity", "water", "gas", "cylinder", "wifi",
            "internet", "broadband", "mobile recharge", "recharge", "dth", "maintenance", "power"
        ],
        "entertainment": [
            "entertainment", "movie", "cinema", "theatre", "netflix", "spotify", "prime",
            "hotstar", "game", "gaming", "concert", "outing", "party", "club", "pvr", "inox", "youtube"
        ],
        "shopping": [
            "shopping", "clothes", "shoes", "amazon", "flipkart", "myntra", "mall", "electronics",
            "gadget", "cosmetics", "salon", "haircut", "zara", "h&m", "meesho", "dress", "shirt"
        ],
        "rent": [
            "rent", "room rent", "flat rent", "pg", "house rent", "brokerage", "deposit", "society"
        ],
        "health": [
            "health", "medical", "medicine", "doctor", "hospital", "pharmacy", "clinic", "lab",
            "apollo", "medplus", "tablet", "pills", "test", "dentist"
        ],
        "education": [
            "education", "fees", "tuition", "college", "school", "books", "course", "udemy", "class"
        ],
        "investments": [
            "investment", "invest", "mutual fund", "sip", "stocks", "gold", "crypto", "shares"
        ],
    }

    FILLER_WORDS = {
        "paid", "spent", "spend", "bought", "buy", "for", "via", "by", "using", "through",
        "to", "at", "in", "on", "from", "madhe", "madhun", "dile", "diye", "kela", "diya",
        "chi", "cha", "che", "ka", "ki", "ke", "ko", "ne", "worth", "cost", "total", "rupees",
        "rs", "inr", "bucks", "gave", "taken", "took"
    }

    @classmethod
    def parse(
        cls,
        text: str,
        categories: List[CategoryResponse],
        reference_date: Optional[date] = None,
    ) -> AIQuickParseResponse:
        """Parse natural language string into a structured expense response."""
        ref = reference_date or date.today()
        cleaned_text = text.strip()
        lower_text = cleaned_text.lower()

        # 1. Extract Date
        parsed_date, remaining_text = cls._extract_date(lower_text, ref)

        # 2. Extract Payment Mode
        payment_mode, remaining_text = cls._extract_payment_mode(remaining_text)

        # 3. Extract Amount
        amount, remaining_text = cls._extract_amount(remaining_text)

        # 4. Extract Category
        category_id, category_name = cls._match_category(lower_text, categories)

        # 5. Extract Title
        title = cls._extract_title(remaining_text, category_name)

        # 6. Notes & Confidence
        notes = f"Parsed via Quick Add: '{cleaned_text}'"
        confidence = 0.95 if amount > 0 else 0.70

        return AIQuickParseResponse(
            title=title,
            amount=amount,
            date=parsed_date,
            category_id=category_id,
            category_name=category_name,
            payment_mode=payment_mode,
            notes=notes,
            confidence=confidence,
            engine_used="local_nlp",
        )

    @classmethod
    def _extract_date(cls, text: str, ref: date) -> Tuple[date, str]:
        """Detect relative and explicit dates, returning (parsed_date, text_without_date)."""
        # Day before yesterday / Parso
        if re.search(r"\b(day before yesterday|parso|parva)\b", text):
            text = re.sub(r"\b(day before yesterday|parso|parva)\b", " ", text)
            return ref - timedelta(days=2), text

        # Yesterday / Kal
        if re.search(r"\b(yesterday|kal|yday)\b", text):
            text = re.sub(r"\b(yesterday|kal|yday)\b", " ", text)
            return ref - timedelta(days=1), text

        # Today / Aaj
        if re.search(r"\b(today|aaj|tonight|this morning)\b", text):
            text = re.sub(r"\b(today|aaj|tonight|this morning)\b", " ", text)
            return ref, text

        # N days ago (e.g. "3 days ago")
        days_ago_match = re.search(r"\b(\d+)\s+days?\s+ago\b", text)
        if days_ago_match:
            days = int(days_ago_match.group(1))
            text = re.sub(r"\b\d+\s+days?\s+ago\b", " ", text)
            return ref - timedelta(days=days), text

        # ISO format YYYY-MM-DD
        iso_match = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", text)
        if iso_match:
            try:
                d = date.fromisoformat(iso_match.group(1))
                if d <= ref:
                    text = text.replace(iso_match.group(1), " ")
                    return d, text
            except ValueError:
                pass

        # DD/MM/YYYY or DD-MM-YYYY
        dmy_match = re.search(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b", text)
        if dmy_match:
            day, month, year = int(dmy_match.group(1)), int(dmy_match.group(2)), int(dmy_match.group(3))
            if year < 100:
                year += 2000
            try:
                d = date(year, month, day)
                if d <= ref:
                    text = text.replace(dmy_match.group(0), " ")
                    return d, text
            except ValueError:
                pass

        return ref, text

    @classmethod
    def _extract_payment_mode(cls, text: str) -> Tuple[str, str]:
        """Detect payment modes and return (payment_mode, text_without_mode)."""
        for pattern, mode in cls.PAYMENT_MODES.items():
            regex = r"\b" + re.escape(pattern) + r"\b"
            if re.search(regex, text):
                text = re.sub(regex, " ", text)
                return mode, text
        return "UPI", text

    @classmethod
    def _extract_amount(cls, text: str) -> Tuple[Decimal, str]:
        """Extract monetary amount from text."""
        # 1. Matches like ₹500, rs 500, rs.500, inr 500, 500rs, 500/-
        curr_pattern = r"(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:rs|/-|₹)"
        match = re.search(curr_pattern, text, re.IGNORECASE)
        if match:
            raw_val = match.group(1) or match.group(2)
            cleaned_val = raw_val.replace(",", "")
            text = text[:match.start()] + " " + text[match.end():]
            try:
                return Decimal(cleaned_val), text
            except Exception:
                pass

        # 2. Matches like 1.5k or 2k
        k_match = re.search(r"\b([\d.]+)\s*k\b", text, re.IGNORECASE)
        if k_match:
            try:
                val = Decimal(k_match.group(1)) * 1000
                text = text[:k_match.start()] + " " + text[k_match.end():]
                return val, text
            except Exception:
                pass

        # 3. Match any isolated number/decimal
        num_matches = list(re.finditer(r"\b\d+(?:\.\d{1,2})?\b", text))
        if num_matches:
            # Prefer the number that is most likely the price
            last_num = num_matches[-1]
            raw_val = last_num.group(0)
            text = text[:last_num.start()] + " " + text[last_num.end():]
            try:
                return Decimal(raw_val), text
            except Exception:
                pass

        return Decimal("100.00"), text

    @classmethod
    def _match_category(
        cls,
        text: str,
        categories: List[CategoryResponse],
    ) -> Tuple[int, str]:
        """Match categories based on user's active categories and semantic synonyms."""
        if not categories:
            return 1, "Other"

        cat_by_name = {c.name.lower().strip(): c for c in categories}

        # 1. Direct category name in text
        for cat in categories:
            c_name = cat.name.lower().strip()
            if re.search(r"\b" + re.escape(c_name) + r"\b", text):
                return cat.id, cat.name

        # 2. Check semantic dictionary
        for sem_group, keywords in cls.CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if re.search(r"\b" + re.escape(kw) + r"\b", text):
                    # Find if user has a category matching this group or keyword
                    for c_name, c_obj in cat_by_name.items():
                        if sem_group in c_name or c_name in sem_group or kw in c_name:
                            return c_obj.id, c_obj.name

        # 3. Fallback to "Other" or first default category
        for cat in categories:
            if "other" in cat.name.lower() or "misc" in cat.name.lower():
                return cat.id, cat.name

        # Default to the first category
        return categories[0].id, categories[0].name

    @classmethod
    def _extract_title(cls, text: str, category_name: str) -> str:
        """Clean leftover text into a readable, capitalized title."""
        # Remove punctuation except alphanumeric
        cleaned = re.sub(r"[^\w\s-]", " ", text)
        words = [w.strip() for w in cleaned.split() if w.strip()]

        # Filter filler words
        filtered = [w for w in words if w.lower() not in cls.FILLER_WORDS and len(w) > 1]

        if not filtered:
            # Fallback to single word from original words or category name
            if words:
                return words[0].capitalize()
            return f"{category_name} Expense"

        title_str = " ".join(filtered)
        # Capitalize nicely
        return title_str.title()[:100]
