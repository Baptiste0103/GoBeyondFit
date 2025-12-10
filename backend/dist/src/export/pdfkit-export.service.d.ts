interface ExerciseConfig {
    sets?: number;
    reps?: number | string;
    weight?: number;
    duration?: number;
    format?: string;
    rest?: string;
    notes?: string;
    film?: boolean;
    rpe?: number;
}
interface Exercise {
    id: string;
    name: string;
    description?: string;
    config?: ExerciseConfig;
}
interface Session {
    id: string;
    title?: string;
    exercises: Exercise[];
}
interface Week {
    id: string;
    weekNumber: number;
    sessions: Session[];
}
interface Block {
    id: string;
    title?: string;
    weeks: Week[];
}
interface ProgramForPDF {
    id: string;
    title: string;
    description?: string;
    blocks: Block[];
}
interface PDFTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headerBg: string;
    cardBorder: string;
    pillEasyBg: string;
    pillMediumBg: string;
    pillHardBg: string;
}
export declare class PdtkitExportService {
    private readonly logger;
    private readonly defaultTheme;
    generateProgramPDF(program: ProgramForPDF, theme?: Partial<PDFTheme>): Promise<Buffer>;
    private renderProgramPDF;
    private addHeader;
    private addDescription;
    private renderBlock;
    private renderWeek;
    private renderSession;
    private renderExercisesTable;
    private drawTableHeader;
    private renderExerciseRow;
    private drawDifficultyPill;
    private getDifficultyLevel;
    private addFooter;
    getThemeOptions(): Record<string, PDFTheme>;
}
export {};
