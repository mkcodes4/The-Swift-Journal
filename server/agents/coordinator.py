import json
import google.generativeai as genai
from core.router import IntentRouter
from core.cache import ResponseCache
from agents.lyrics_agent import LyricsAgent
from agents.stats_agent import StatisticsAgent

class SwiftieCoordinator:
    def __init__(self, api_key: str, lyrics_agent: LyricsAgent, stats_agent: StatisticsAgent):
        genai.configure(api_key=api_key)
        # Using 1.5 Flash for the single final call as it has much more generous free tier limits
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.router = IntentRouter()
        self.cache = ResponseCache()
        self.lyrics_agent = lyrics_agent
        self.stats_agent = stats_agent

    async def handle_query(self, query: str, context: str):
        print(f"\n[Coordinator] Incoming query: {query}")
        
        # 0. Check Cache First (Zero Cost!)
        cached_res = self.cache.get(query)
        if cached_res:
            print("[Coordinator] Cache Hit! Returning saved response.")
            return cached_res

        # 1. Deterministic Intent Routing (NO LLM)
        route_info = self.router.route(query)
        intent = route_info['intent']
        print(f"[Coordinator] Detected Intent: {intent} (Confidence: {route_info['confidence']})")
        
        # 2. Execute Deterministic Tools (NO LLM)
        evidence = []
        
        if intent == "lyrics_search" or intent == "theme_lookup":
            res = await self.lyrics_agent.run(query)
            evidence.append({"source": "lyrics_engine", "data": res})
            
        elif intent == "album_stats" or intent == "comparison":
            res = await self.stats_agent.run(query)
            evidence.append({"source": "stats_engine", "data": res})
            
        elif intent == "general":
            print("[Coordinator] No specific tool required. Direct synthesis.")

        # 3. SINGLE LLM CALL: Synthesis & Formatting
        # We provide the evidence as ground truth to the LLM
        synthesis_prompt = f"""
        You are "Swiftie-AI", a friendly and knowledgeable expert.
        USER QUERY: {query}
        CONTEXT: {context}
        EVIDENCE GATHERED: {json.dumps(evidence)}
        
        TASK:
        1. Answer the user's question using ONLY the evidence provided.
        2. If no evidence was found, answer based on your general Taylor Swift knowledge but keep it brief.
        3. Keep the response friendly, proper English, and concise (2-4 sentences).
        4. Mention specific stats or lyrics if they are in the evidence.
        """
        
        print("[Coordinator] Executing final (and only) LLM call for synthesis...")
        response = self.model.generate_content(synthesis_prompt)
        final_answer = response.text
        
        # 4. Save to Cache
        result = {
            "answer": final_answer,
            "intent": intent,
            "evidence_count": len(evidence),
            "plan": "deterministic_flow_v2"
        }
        self.cache.set(query, result)
        
        return result
