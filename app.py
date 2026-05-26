import streamlit as st
import re
from urllib.parse import urlparse
from datetime import datetime

# --- 1. SPAM LOGIC (Ported from your Backend) ---
SPAM_KEYWORDS = {
    "free", "money", "bitcoin", "crypto", "click", "link", 
    "prize", "winner", "nigerian", "prince", "get", "rich", 
    "exclusive", "offer", "limited", "time", "buy", "now", 
    "otp", "verification", "code", "verify", "confirm", "login"
}

MALICIOUS_DOMAIN_BLACKLIST = {"free-rewards-now.com", "secure-login-update.net", "bitcoin-gains.ru"}

def analyze_message(content):
    normalized = content.lower()
    # Keyword check
    cleaned = re.sub(r'[^\w\s]', '', normalized)
    words = set(cleaned.split())
    matches = words.intersection(SPAM_KEYWORDS)
    
    # URL check
    url_pattern = re.compile(r'https?:\/\/[^\s]+', re.I)
    links = url_pattern.findall(content)
    is_malicious_link = any(urlparse(l).netloc.replace('www.', '').lower() in MALICIOUS_DOMAIN_BLACKLIST for l in links)
    
    return {
        "is_spam": len(matches) > 0 or is_malicious_link,
        "reason": f"Keywords found: {', '.join(matches)}" if matches else "Suspicious link detected"
    }

# --- 2. STREAMLIT UI SETUP ---
st.set_page_config(page_title="Spam-Aware Messenger", page_icon="🛡️")

st.title("🛡️ Secure Messenger")
st.caption("Deterministic Spam Filtering Active")

# Initialize Chat History
if "messages" not in st.session_state:
    st.session_state.messages = []

# Sidebar for "Contacts" (Simulated)
with st.sidebar:
    st.header("Contacts")
    st.radio("Active Chat", ["Unknown (7396273145)", "Mom", "Bestie", "Big Boss"])
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()

# --- 3. DISPLAY MESSAGES ---
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if message.get("is_spam"):
            st.warning(f"⚠️ Potential Spam: {message['spam_reason']}")

# --- 4. CHAT INPUT & LOGIC ---
if prompt := st.chat_input("Type your message here..."):
    # User Message
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    # Run Analysis
    analysis = analyze_message(prompt)
    
    # Simulate a Response
    response = "I received your message."
    if analysis["is_spam"]:
        response = "🚨 BLOCKING NOTICE: Your message triggered our spam filters."
    
    st.session_state.messages.append({
        "role": "assistant", 
        "content": response,
        "is_spam": analysis["is_spam"],
        "spam_reason": analysis["reason"]
    })
    
    st.rerun()