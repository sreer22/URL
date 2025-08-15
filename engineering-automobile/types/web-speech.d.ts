interface SpeechRecognitionAlternative { transcript: string; confidence: number }
interface SpeechRecognitionResult { length: number; item(index: number): SpeechRecognitionAlternative; [index: number]: SpeechRecognitionAlternative }
interface SpeechRecognitionResultList { length: number; item(index: number): SpeechRecognitionResult; [index: number]: SpeechRecognitionResult }
interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList }