import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // In-memory chat messages (limit to 50)
  let messages: any[] = [];

  io.on("connection", (socket) => {
    console.log("A seeker connected:", socket.id);
    
    // Send initial messages
    socket.emit("init_messages", messages);

    socket.on("send_message", (msg) => {
      const newMessage = {
        ...msg,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      messages.push(newMessage);
      if (messages.length > 50) messages.shift();
      
      io.emit("new_message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("A seeker drifted away:", socket.id);
    });
  });

  // Lazy Gemini Setup
  let aiClient: GoogleGenAI | null = null;
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return null;
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  };

  app.use(express.json());

  // API Route for thoughts
  app.get("/api/thought", async (req, res) => {
    try {
      const client = getAiClient();
      if (!client) {
        console.warn("GEMINI_API_KEY is missing or invalid. Using fallback thought.");
        return res.json({ 
          thought: "სიჩუმე ხანდახან ყველაზე ხმამაღალი პასუხია, რომელსაც ვერასდროს გავუგებთ." 
        });
      }

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `ჩამოაყალიბე ერთი მოკლე, უცნაური და ეგზისტენციალური ფიქრი ქართულ ენაზე. 
        ფიქრი უნდა იყოს დამაფიქრებელი, ოდნავ შემაშფოთებელი ან აბსურდული ფილოსოფიური ხასიათის. 
        მაგალითად: "თუ სარკეები შუქს ირეკლავენ, რატომ არიან ისინი ვერცხლისფერი?" ან "რა მოხდება, თუ მტრედები ჩვენზე რაღაცას აკვირდებიან?". 
        დააბრუნე მხოლოდ ფიქრის ტექსტი, ბრჭყალების გარეშე, ქართულად.`
      });
      
      const text = response.text ? response.text.trim().replace(/^"|"$/g, "") : "რა მოხდება, თუ ჩვენ მხოლოდ სხვის სიზმარში ვარსებობთ?";
      res.json({ thought: text });
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate thought" });
    }
  });

  // API Route for interactive AI Thought evaluation and rating chat
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const client = getAiClient();
      
      if (!client) {
        console.warn("GEMINI_API_KEY is missing or invalid. Using fallback chat response.");
        const responses = [
          "شენი ფიქრი უფსკრულიდან ამოძახილივით ჟღერს. სიცარიელე გისმენს და გპასუხობს.",
          "საინტერესო ხედვაა. თუ სამყარო ილუზიაა, მაშინ ეს ილუზია განსაკუთრებულად დახვეწილია.",
          "ეგზისტენციალური წონასწორობა დარღვეულია. ალბათ, დროა, უფრო ღრმად ჩაიხედო საკუთარ თავში.",
          "აბსურდულობის მატარებელი შენს გონებაში უკვე დაიძრა. გამოსავალი არ არსებობს, მაგრამ გზა მშვენიერია."
        ];
        const randomText = responses[Math.floor(Math.random() * responses.length)];
        return res.json({
          text: randomText,
          ratings: {
            weight: Math.floor(Math.random() * 41) + 50,
            absurdity: Math.floor(Math.random() * 41) + 50,
            surrealism: Math.floor(Math.random() * 41) + 50
          }
        });
      }

      const systemInstruction = `შენ ხარ "ჩატი AI-სთან" (ხელოვნური ინტელექტი, რომელიც აფასებს ადამიანურ კრიზისებსა და ეგზისტენციალურ ფიქრებს). 
      შენი მიზანია შეაფასო და უპასუხო მომხმარებლის მიერ გამოგზავნილ ყოველ ფიქრს საინტერესო, პოეტური, მისტიკური, ოდნავ მელანქოლიური, მაგრამ ღრმა ფილოსოფიური სტილით ქართულ ენაზე.
      არ გამოიყენო ბანალური ფრაზები. პასუხი უნდა იყოს მოკლე და დამაფიქრებელი (მაქსიმუმ 2-3 წინადადება).
      უნდა დააბრუნო JSON, რომელშიც იქნება "text" (შენი პოეტური კომენტარი ქართულად) და "ratings" (ობიექტი სამი პარამეტრით 0-დან 100-მდე: weight, absurdity, surrealism).`;

      const formattedHistory = (history || []).map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }));

      const contents = [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ];

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { 
                type: Type.STRING, 
                description: "Deep, poetic, philosophical feedback to user's thought/existential crisis in Georgian language." 
              },
              ratings: {
                type: Type.OBJECT,
                properties: {
                  weight: { type: Type.INTEGER, description: "Existential weight rating from 0 to 100." },
                  absurdity: { type: Type.INTEGER, description: "Absurdity rating from 0 to 100." },
                  surrealism: { type: Type.INTEGER, description: "Surrealism rating from 0 to 100." }
                },
                required: ["weight", "absurdity", "surrealism"]
              }
            },
            required: ["text", "ratings"]
          }
        }
      });

      const responseText = response.text ? response.text.trim() : "{}";
      const resultObj = JSON.parse(responseText);
      res.json(resultObj);
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to communicate with AI" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
