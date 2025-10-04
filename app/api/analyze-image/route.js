// app/api/analyze-image/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";
import songs from "../../../data/songs.json";   // <- path to your dataset

export const runtime = "nodejs";               // keep OpenAI SDK happy

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

    // Vision call (you can swap to gpt-4o if you want)
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Analyze this image vibe. Return descriptive text; mention colors, mood, scene, era, style." },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }],
      max_tokens: 400
    });

    const analysis = resp.choices?.[0]?.message?.content ?? "";

    // simple overlap scoring vs data/songs.json
    const needle = analysis.toLowerCase();
    const matches = songs.map(song => {
      let matchScore = 0;
      const matchedTags = [];
      for (const tag of song.tags) {
        const t = tag.toLowerCase();
        if (needle.includes(t)) { matchScore += 10; matchedTags.push(tag); }
        else {
          const parts = t.split(" ").filter(w => w.length > 3);
          const hits = parts.filter(w => needle.includes(w)).length;
          if (hits) { matchScore += 5 * hits; matchedTags.push(tag); }
        }
      }
      return { ...song, matchScore, matchingTags: matchedTags };
    })
    .filter(s => s.matchScore > 0)
    .sort((a,b) => b.matchScore - a.matchScore)
    .slice(0, 10);

    return NextResponse.json({ analysis, matches, totalMatches: matches.length });
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
