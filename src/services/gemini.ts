
export async function generateExistentialThought() {
  try {
    const response = await fetch("/api/thought");
    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.thought;
  } catch (error) {
    console.error("Error generating thought:", error);
    return "რა მოხდება, თუ სიჩუმე სინამდვილეში რაღაცას გვეუბნება, მაგრამ ჩვენ მოსმენა არ შეგვიძლია?";
  }
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  ratings?: {
    weight: number;
    absurdity: number;
    surrealism: number;
  };
}

export async function sendChatToAi(message: string, history: ChatMessage[]) {
  try {
    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history.map(h => ({
          sender: h.sender,
          text: h.text
        }))
      })
    });
    if (!response.ok) throw new Error("AI Chat API failed");
    const data = await response.json();
    return data as { text: string; ratings: { weight: number; absurdity: number; surrealism: number } };
  } catch (error) {
    console.error("Error in AI Chat:", error);
    return {
      text: "სივრცე დროებით მიუწვდომელია. ალბათ ყოფიერების სიღრმეებში რაღაც სხვა ხდება...",
      ratings: {
        weight: 30,
        absurdity: 20,
        surrealism: 10
      }
    };
  }
}
