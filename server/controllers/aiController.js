const { GoogleGenerativeAI } = require('@google/generative-ai');

// Fallback specialty mapper based on keywords in case LLM API quota or key fails
const fallbackSpecialtyMap = (symptoms) => {
  const text = symptoms.toLowerCase();
  if (text.includes('heart') || text.includes('chest pain') || text.includes('palpitation') || text.includes('bp')) {
    return { specialty: 'Cardiologist', reasoning: 'Chest and cardiac symptoms suggest seeing a heart specialist.' };
  }
  if (text.includes('skin') || text.includes('rash') || text.includes('acne') || text.includes('itching')) {
    return { specialty: 'Dermatologist', reasoning: 'Skin issues and eruptions should be evaluated by a dermatologist.' };
  }
  if (text.includes('headache') || text.includes('migraine') || text.includes('dizzy') || text.includes('numbness')) {
    return { specialty: 'Neurologist', reasoning: 'Neurological symptoms like frequent headaches or numbness require a neurologist.' };
  }
  if (text.includes('bone') || text.includes('joint') || text.includes('fracture') || text.includes('knee')) {
    return { specialty: 'Orthopedist', reasoning: 'Joint and bone pain are best evaluated by an orthopedic doctor.' };
  }
  if (text.includes('stomach') || text.includes('acidity') || text.includes('digestion') || text.includes('vomit')) {
    return { specialty: 'Gastroenterologist', reasoning: 'Digestive and gastrointestinal symptoms indicate a gastroenterologist.' };
  }
  if (text.includes('tooth') || text.includes('teeth') || text.includes('gum') || text.includes('cavity')) {
    return { specialty: 'Dentist', reasoning: 'Dental pain and oral hygiene issues should be seen by a dentist.' };
  }
  if (text.includes('ear') || text.includes('nose') || text.includes('throat') || text.includes('sinus')) {
    return { specialty: 'ENT Specialist', reasoning: 'Ear, nose, and throat symptoms should be evaluated by an ENT specialist.' };
  }
  return { specialty: 'General Physician', reasoning: 'General symptoms are best assessed by a primary care physician for initial diagnosis.' };
};

// POST /api/ai/navigate  – symptom → specialty recommendation
exports.navigate = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a meaningful symptom description (at least 5 characters)' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('your_gemini')) {
      const fallback = fallbackSpecialtyMap(symptoms);
      return res.json({ success: true, data: fallback });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a medical triage assistant. Given the patient's symptom description below, respond ONLY with valid JSON in this exact shape: { "specialty": "<string>", "reasoning": "<one sentence>" }. Do not include any text outside the JSON object. Common specialties to choose from include: General Physician, Cardiologist, Dermatologist, Neurologist, Orthopedist, Pulmonologist, Gastroenterologist, Endocrinologist, Psychiatrist, ENT Specialist, Ophthalmologist, Gynecologist, Pediatrician, Urologist, Nephrologist, Oncologist, Rheumatologist, Dentist.

Symptoms: ${symptoms}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI returned an unexpected format');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.specialty || !parsed.reasoning) {
        throw new Error('AI response missing required fields');
      }

      return res.json({ success: true, data: parsed });
    } catch (apiErr) {
      console.warn('Gemini API call failed, using intelligent rule-based triage fallback:', apiErr.message);
      const fallback = fallbackSpecialtyMap(symptoms);
      return res.json({ success: true, data: fallback });
    }
  } catch (err) {
    console.error('AI navigate error:', err);
    res.status(500).json({
      success: false,
      message: 'AI service error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
