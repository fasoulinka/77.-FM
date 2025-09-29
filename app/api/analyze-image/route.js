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
    
    // Better matching - count absolute matches, not percentages
    const analysisLower = analysis.toLowerCase();

    const matches = songs.map(song => {
      let matchScore = 0;
      const matchedTags = [];
      
      song.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        
        // Direct substring match in analysis
        if (analysisLower.includes(tagLower)) {
          matchScore += 10;
          matchedTags.push(tag);
        }
        // Check if individual words from multi-word tags match
        else {
          const tagWords = tagLower.split(' ');
          const matchingWords = tagWords.filter(word => 
            word.length > 3 && analysisLower.includes(word)
          );
          if (matchingWords.length > 0) {
            matchScore += 5 * matchingWords.length;
            matchedTags.push(tag);
          }
        }
      });
      
      return {
        ...song,
        matchScore,
        matchingTags: matchedTags
      };
    })
    .filter(song => song.matchScore > 0)
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
