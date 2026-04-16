const Anthropic = require('@anthropic-ai/sdk');
const { fetchImageAsBase64 } = require('./images');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DISTRESS_PROMPT = `You are an expert real estate analyst specializing in identifying distressed properties.
You will be shown two images of a property: a street view and a satellite view.
Analyze both images carefully for signs of property distress and neglect.

Look for these specific distress indicators:
- Overgrown lawn / unmaintained landscaping
- Junk cars or abandoned vehicles ON THE PROPERTY (yard or driveway only — ignore all cars on the public street or road in front of the house)
- Tarp on roof (blue/green tarps indicating roof damage)
- Boarded windows or doors
- Peeling/chipping paint on exterior
- Broken or missing gutters/downspouts
- Structural damage visible
- Abandoned appearance / no signs of habitation
- Trash or hoarding visible
- Fence damage or collapse
- Broken windows
- Water damage or staining
- Fire damage (char marks, burned siding, scorched roof, smoke staining, fire-damaged structure)
- General severe neglect

IMPORTANT: Do NOT flag cars that are driving on or parked on the public street/road. Only flag vehicles that are sitting in the yard, on the lawn, or abandoned on the driveway of the property itself.

Respond with ONLY valid JSON in this exact format:
{
  "distressScore": <integer 1-10>,
  "flags": ["flag1", "flag2", ...],
  "reasoning": "Brief explanation of score and key observations"
}

Scoring guide:
1-2: No visible distress, well-maintained property
3-4: Minor issues (slightly overgrown, minor deferred maintenance)
5-6: Moderate distress (multiple visible issues, clear neglect)
7-8: Significant distress (major visible problems, likely vacant)
9-10: Severe distress (extreme neglect, structural issues, fire damage, likely abandoned)

If images are unavailable or unclear, score as 1 and note in reasoning.`;

async function scoreProperty(streetViewUrl, satelliteUrl) {
  const imageContents = [];

  // Fetch street view image
  try {
    const sv = await fetchImageAsBase64(streetViewUrl);
    imageContents.push({
      type: 'image',
      source: { type: 'base64', media_type: sv.mediaType, data: sv.base64 },
    });
    imageContents.push({ type: 'text', text: 'Above: Street View image of the property.' });
  } catch (err) {
    imageContents.push({ type: 'text', text: 'Street View image unavailable.' });
  }

  // Fetch satellite image
  try {
    const sat = await fetchImageAsBase64(satelliteUrl);
    imageContents.push({
      type: 'image',
      source: { type: 'base64', media_type: sat.mediaType, data: sat.base64 },
    });
    imageContents.push({ type: 'text', text: 'Above: Satellite image of the property.' });
  } catch (err) {
    imageContents.push({ type: 'text', text: 'Satellite image unavailable.' });
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: DISTRESS_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: 'Please analyze these property images and provide a distress score.',
          },
        ],
      },
    ],
  });

  const text = response.content[0].text.trim();

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid JSON response from Claude');

  const result = JSON.parse(jsonMatch[0]);

  return {
    distressScore: Math.min(10, Math.max(1, Math.round(result.distressScore))),
    flags: Array.isArray(result.flags) ? result.flags : [],
    reasoning: result.reasoning || '',
  };
}

module.exports = { scoreProperty };
