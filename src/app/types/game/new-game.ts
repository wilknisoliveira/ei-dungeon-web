export interface NewGame {
    characterName: string;
    characterDescription: string;
    name: string;
    race: string;
    gameLanguage: string;
    skills: Skills;
}

export interface Skills {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
}
