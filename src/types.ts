export type Mood = 'numb' | 'curious' | 'terrified' | 'existential' | 'void' | 'absurd' | 'confusing';

export interface Rating {
  intensity: number; // 0-100
  distortion: number; // 0-100
  deprivation: number; // 0-100
  weight: number; // 0-100
  likelihood3AM: number; // 0-100
}

export interface Comment {
  id: string;
  text: string;
  timestamp: number;
  corruptionLevel: number; // 0-1
}

export interface Post {
  id: string;
  content: string;
  tag: string;
  timestamp: number;
  rating: Rating;
  votes: number;
  comments: Comment[];
  isAiGenerated?: boolean;
  authorId?: string;
}

export const TRANSLATIONS = {
  siteName: "შეაფასე ჩემი ეგზისტენციალური კრიზისი",
  void: "სიცარიელე",
  whispers: "ჩურჩულის დარბაზი",
  oracle: "ჩატი AI-სთან",
  postAnonymously: "ანონიმური პოსტი",
  mostDisturbing: "დღის ყველაზე შემაშფოთებელი ფიქრი",
  existentialWeight: "ეგზისტენციალური წონა",
  unsettling: "შემაშფოთებელი",
  dissociating: "დისოციაცია",
  realizing: "გაცნობიერება",
  activeSeekers: "აქტიური მაძიებლები",
  staringIntoAbyss: "უფსკრულში ცქერა...",
  systemStatus: "სისტემის სტატუსი: ყველა რეალობა სტაბილურია (ალბათ)",
  uptime: "მუშაობის დრო: 13.8 მილიარდი წელი",
  session: "სესია",
  submit: "გაგზავნა",
  cancel: "გაუქმება",
  placeholder: "რაზე ფიქრობ ამაღამ?...",
  moods: {
    numb: "გაშეშებული",
    curious: "ცნობისმოყვარე",
    terrified: "შეშინებული",
    existential: "ეგზისტენციალური",
    void: "სიცარიელე",
    absurd: "აბსურდული",
    confusing: "დამაბნეველი"
  }
};
