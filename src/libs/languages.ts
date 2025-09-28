export interface Language {
    id: string; // Language ID (generally the same as the name in lowercase)
    name: string; // Language name (displayed in the UI)
    color: string; // Github hex color
};

export const LANGUAGES = {
    RUST: { id: 'rust', name: 'Rust', color: '#dea584' },
    PYTHON: { id: 'python', name: 'Python', color: '#3572A5' },
    JAVASCRIPT: { id: 'javascript', name: 'JavaScript', color: '#f1e05a' },
    TYPESCRIPT: { id: 'typescript', name: 'TypeScript', color: '#2b7489' },
    C: { id: 'c', name: 'C', color: '#555555' },
    CPLUSPLUS: { id: 'cpp', name: 'C++', color: '#f34b7d' },
    JAVA: { id: 'java', name: 'Java', color: '#b07219' },
    GO: { id: 'go', name: 'Go', color: '#00ADD8' },
    HTML: { id: 'html', name: 'HTML', color: '#e34c26' },
    CSS: { id: 'css', name: 'CSS', color: '#563d7c' },
    SCSS: { id: 'scss', name: 'SCSS', color: '#c6538c' },
    MATLAB: { id: 'matlab', name: 'MATLAB', color: '#e16737' },
    CSHARP: { id: 'csharp', name: 'C#', color: '#178600' },
    SWIFT: { id: 'swift', name: 'Swift', color: '#ffac45' },
    KOTLIN: { id: 'kotlin', name: 'Kotlin', color: '#F18E33' },
    SCALA: { id: 'scala', name: 'Scala', color: '#c22d40' },
    SVELTE: { id: 'sveltejs', name: 'Svelte', color: '#ff3e00' },
};

export function getLanguageColor(language: Language): string {
    return language.color;
}

export function getLanguageHoverColor(language: Language): string {
    return `${language.color}CC`;
}

export function getLanguageById(id: string): Language | undefined {
    const langKey = Object.keys(LANGUAGES).find(key => LANGUAGES[key as keyof typeof LANGUAGES].id === id.toLowerCase());
    return langKey ? LANGUAGES[langKey as keyof typeof LANGUAGES] : undefined;
}