import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import songs from '../../../data/songs.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    // Analyze image with GPT-4o Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Analyze this image's vibe and aesthetic in detail. Describe: colors (pink, blue, purple, red, gold, etc), mood (energetic, melancholic, chill, romantic, confident), setting (street, beach, cafe, party, nature), time period (Y2K, vintage, 90s, 2000s, retro), style (fashion, indie, luxury, minimalistic), activity (party, relaxed, dancing, working), and any cultural references. Use specific descriptive tags." 
          },
          { 
            type: "image_url", 
            image_url: { url: imageUrl } 
          }
        ]
      }],
      max_tokens: 500
    });

    const analysis = response.choices[0].message.content;
    
    // Extract keywords
    const keywords = analysis.toLowerCase()
      .split(/[\s,.:;!?()]+/)
      .filter(word => word.length > 2);
    
    // Match songs based on tag overlap
    const matches = songs.map(song => {
      const songTags = song.tags.map(t => t.toLowerCase());
      const matchingTags = songTags.filter(tag => 
        keywords.some(keyword => 
          keyword.includes(tag) || 
          tag.includes(keyword) ||
          keyword === tag
        )
      );
      
      const score = matchingTags.length > 0 
        ? (matchingTags.length / songTags.length) * 100 
        : 0;
      
      return {
        ...song,
        matchScore: Math.round(score),
        matchingTags
      };
    })
    .filter(song => song.matchScore > 10)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

    return NextResponse.json({ 
      analysis, 
      matches,
      totalMatches: matches.length 
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' }, 
      { status: 500 }
    );
  }
}
