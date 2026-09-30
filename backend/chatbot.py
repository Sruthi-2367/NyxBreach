import ollama

def ask_security_copilot(question: str, relevant_alerts: list) -> str:
    # Step A: Build context from the actual alert data (this is the "RAG grounding")
    if relevant_alerts:
        context = "\n\n".join([
            f"Alert #{a.id} ({a.alert_type}, severity: {a.severity}): {a.title}\n"
            f"Description: {a.description}\n"
            f"Why it fired: {a.explanation}\n"
            f"Recommended action: {a.recommended_action}"
            for a in relevant_alerts
        ])
    else:
        context = "No alerts are currently on record for this user."

    # Step B: Build the full prompt combining context + user question
    prompt = f"""You are NyxBreach's AI security co-pilot. You help users understand their security alerts and what to do about them.

Here is the user's current alert data:
{context}

User's question: {question}

Answer clearly and concisely, based only on the alert data above. If the question can't be answered from this data, say so honestly."""

    # Step C: Send to the local LLM and get the response
    response = ollama.chat(
        model="llama3.2:3b",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]