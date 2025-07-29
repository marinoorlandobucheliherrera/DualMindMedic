# **App Name**: DualMind Medic

## Core Features:

- Dual AI Engine Selector: Allows the user to select between Ollama (local) or Google AI (cloud) as the processing engine.
- AI-Powered Text Extraction: Extracts text from medical documents using either the local or cloud AI engine, based on the user's selection.
- Clinical Concept Extraction: Extracts clinical concepts from medical texts using the selected AI engine.
- AI-Driven Diagnosis Suggestion: Suggests diagnoses based on the extracted clinical concepts, using the chosen AI provider.
- AI-Based Clinical Summary: Summarizes clinical notes using the selected AI engine. The tool reasons when to incorporate details into the output summary.
- Result Display: Displays the extracted information, diagnoses and summary results clearly.
- Selection Persistence: Stores the user's AI engine selection locally, and persist it between sessions using local storage.

## Style Guidelines:

- Primary color: A muted, professional blue (#5DADE2) to convey trust and reliability in a healthcare context.
- Background color: Light, desaturated blue (#EBF5FB) to provide a clean and calming visual experience.
- Accent color: A contrasting light orange (#F39C12) to highlight important actions and information.
- Font pairing: 'Inter' (sans-serif) for both headings and body text. A clean and readable typeface is used to ensure clarity in medical documentation.
- Use a set of clear, professional icons that align with healthcare themes (e.g., a stethoscope for diagnoses, document for text extraction).
- Implement a clean, card-based layout to separate functionalities. Prioritize readability and quick access to core features.
- Use subtle transitions and loading animations to improve the user experience, particularly when switching between AI providers or processing data.