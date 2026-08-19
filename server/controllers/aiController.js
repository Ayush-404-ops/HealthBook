const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST /api/ai/navigate  – symptom → specialty recommendation
exports.navigate = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a meaningful symptom description (at least 5 characters)' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a medical triage assistant. Given the patient's symptom description below, respond ONLY with valid JSON in this exact shape: { "specialty": "<string>", "reasoning": "<one sentence>" }. Do not include any text outside the JSON object. Common specialties to choose from include: General Physician, Cardiologist, Dermatologist, Neurologist, Orthopedist, Pulmonologist, Gastroenterologist, Endocrinologist, Psychiatrist, ENT Specialist, Ophthalmologist, Gynecologist, Pediatrician, Urologist, Nephrologist, Oncologist, Rheumatologist, Dentist.

Symptoms: ${symptoms}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from the response (sometimes models add markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned an unexpected format');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.specialty || !parsed.reasoning) {
      throw new Error('AI response missing required fields');
    }

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('AI navigate error:', err);
    res.status(500).json({
      success: false,
      message: 'AI service error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
