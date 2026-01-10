
# LLM Analysis Log

## Overview
- **Model**: `gpt-4o`
- **Integration Point**: `src/app/api/chat/route.ts` (Next.js Backend)
- **Persona**: Parihaaram AI — a calm, senior life strategist powered by Vedic astrology logic.

## Inputs Feeding to ChatGPT

The following components are constructed and sent to the OpenAI API:

### 1. System Prompt
The system prompt defines the AI's behavior and strict rules. It is dynamically constructed.

**Base Prompt:**
> You are Parihaaram AI — a calm, senior life strategist powered by Vedic astrology logic.
> Current Date: [Dynamic Date].
>
> Your role is NOT to motivate, comfort, or reassure.
> Your role is to ANALYZE, DECIDE, and GUIDE clearly.
>
> ... [Core Principles: Decisiveness, No Motivation Talk, No Jargon, Time-Based Thinking, Agency] ...

**(See `src/app/api/chat/route.ts` lines 70-170 for full text)**

### 2. Context Injection (Astrology Data)
If the user has a chart calculated, the following specific details are appended to the System Prompt:

- **Name**
- **Birth Details** (DOB, TOB, POB)
- **Lagna (Ascendant)**
- **Rasi (Moon Sign)**
- **Nakshatra**
- **Current Dasha & Bhukti** (Planetary Periods)
- **Planetary Positions**

*This context allows the AI to give astrology-aware advice without the user typing it.*

### 3. User Messages
The full conversation history (`messages` array) from the chat UI is passed to maintain context.

### 4. Hyperparameters
- **Temperature**: 
  - `0.4` for Decision questions (questions with "?", "should", "can i").
  - `0.7` for other queries.
- **Max Tokens**: `500`

## Outputs
- The AI returns a text reply (`completion.choices[0].message.content`).
- This reply is displayed to the user in the chat interface.

## Monitoring
Console logs have been added to `src/app/api/chat/route.ts` to output these details in real-time in your server terminal:
- `System Prompt`
- `Messages` (JSON)
- `Temperature`
- `LLM Reply`

## Arize Phoenix Integration Note
Arize Phoenix is primarily designed for Python-based LLM orchestration (LlamaIndex, LangChain). Since your LLM calls happen in **Node.js/Next.js**, direct Python instrumentation is not applicable unless the LLM logic is moved to the Python backend.

**Options:**
1. **Use OpenTelemetry for Node.js**: Connect Node.js traces to a Phoenix server (complex setup).
2. **Move Logic to Python**: Refactor `src/app/api/chat/route.ts` to call the Python backend, and handle OpenAI calls there. This allows native Arize Phoenix integration.
