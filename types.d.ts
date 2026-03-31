// === Zentrale Typdefinitionen für Schatzinsel ===
// Kein Build-Schritt nötig — wird nur von tsconfig.json + Editor genutzt.

// --- Material ---
interface Material {
    emoji: string;
    label: string;
    color: string;
    border: string;
}

type MaterialId = string;
type MaterialMap = Record<MaterialId, Material>;

// --- Grid ---
type GridCell = MaterialId | null;
type Grid = GridCell[][];

// --- Storage ---
interface InselStorage {
    get(key: string, fallback?: string): string | null;
    set(key: string, value: string): void;
    getJSON<T = unknown>(key: string, fallback?: T): T | null;
    setJSON(key: string, value: unknown): void;
    remove(key: string): void;
    keys(): string[];
    usageBytes(): number;
    PREFIX: string;
}

// --- Sound ---
interface InselSound {
    [key: string]: unknown;
    soundBuild?(material: MaterialId): void;
    soundDemolish?(getGridStats: () => GridStats): void;
    soundAchievement?(): void;
    soundQuestComplete?(): void;
    soundChop?(): void;
    soundCraft?(): void;
    soundSelect?(material: MaterialId): void;
    soundFirstBlock?(): void;
    setMasterVolume?(v: number): void;
    getMasterVolume?(): number;
    setMuted?(m: boolean): void;
    isMuted?(): boolean;
}

// --- Achievements ---
interface Achievement {
    emoji: string;
    title: string;
    desc: string;
    check(stats: GridStats): boolean;
}

type AchievementMap = Record<string, Achievement>;

// --- Grid Stats ---
interface GridStats {
    counts: Record<MaterialId, number>;
    total: number;
    percent: number;
    uniqueMats: number;
    playerPlaced: number;
    questsDone: number;
    blueprintsDone: number;
    recipesFound: number;
    materialsFound: number;
    wuXingUsed: number;
    recipesUsed: number;
    florianeWishes: number;
    bugsReported: number;
    npcsSpokenTo: number;
    npcCount: number;
    darkModeUsed: boolean;
    idleMinutes: number;
    sessionPlaced: number;
}

// --- Quests ---
interface QuestTemplate {
    npc: string;
    title: string;
    desc: string;
    needs: Record<MaterialId, number>;
    reward: string;
}

interface ActiveQuest extends QuestTemplate {
    accepted: number;
    baseline: Record<MaterialId, number>;
}

interface QuestSystem {
    getAvailable(npcId: string): QuestTemplate | undefined;
    accept(quest: QuestTemplate): void;
    getActive(): ActiveQuest[];
    getCompleted(): string[];
}

// --- Recipes ---
interface Recipe {
    name: string;
    result: MaterialId;
    resultCount: number;
    ingredients: Record<MaterialId, number>;
    desc: string;
}

// --- Blueprints ---
type PatternCell = MaterialId | null | '*';

interface Blueprint {
    id: string;
    name: string;
    emoji: string;
    desc: string;
    pattern: PatternCell[][];
}

interface BlueprintMatch {
    blueprint: Blueprint;
    startR: number;
    startC: number;
}

interface OverlayCell {
    r: number;
    c: number;
    material: PatternCell;
    status: 'placed' | 'missing' | 'wrong';
}

interface InselBlueprints {
    BLUEPRINTS: Blueprint[];
    findBlueprint(grid: Grid, r: number, c: number, rows: number, cols: number): BlueprintMatch | null;
    matchPattern(grid: Grid, startR: number, startC: number, rows: number, cols: number, pattern: PatternCell[][]): boolean;
    getOverlay(grid: Grid, startR: number, startC: number, rows: number, cols: number, pattern: PatternCell[][]): OverlayCell[];
}

// --- Automerge ---
interface MergeRule {
    a: MaterialId;
    b: MaterialId;
    result: MaterialId;
    msg: string;
}

interface TripletRule {
    materials: MaterialId[];
    result: MaterialId;
    msg: string;
}

interface MergeResult {
    type: 'pair' | 'triplet';
    cells: [number, number][];
    result: MaterialId;
    msg: string;
}

interface InselAutomerge {
    checkMerge(grid: Grid, r: number, c: number, rows: number, cols: number): MergeResult | null;
    MERGE_RULES: MergeRule[];
    TRIPLET_RULES: TripletRule[];
}

// --- Healthcheck ---
interface InselHealthcheck {
    checkup(): { ts: string; craftKeysPruned: number; llmMatsPruned: number; eggsPruned: number; gridRepaired: number; storageBytes: number };
    estimateStorageSize(): number;
}

// --- Screensaver ---
interface InselScreensaver {
    start(): void;
    stop(): void;
}

// --- NATURE ---
interface NatureCallbacks {
    addPlaceAnimation(r: number, c: number): void;
    unlockMaterial(mat: string): void;
    updateStats(): void;
    showToast(msg: string, duration?: number): void;
    requestRedraw(): void;
}

interface InselNature {
    treeGrowth: Record<string, number>;
    updateTreeGrowth(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap, callbacks: NatureCallbacks): void;
    updateWorldConsequences(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap, callbacks: NatureCallbacks): void;
    start(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap, callbacks: NatureCallbacks): void;
}

// --- ELIZA ---
interface ElizaInstance {
    transform(input: string): string;
    reset(): void;
}

interface InselEliza {
    create(script: ElizaScript): ElizaInstance;
    getEliza?(charId: string): ElizaInstance | null;
    [key: string]: unknown;
}

interface ElizaScript {
    initial?: string;
    finale?: string;
    quit?: string[];
    pre?: Record<string, string>;
    post?: Record<string, string>;
    keywords?: Array<{
        key: string;
        rank?: number;
        rules: Array<{
            pattern: string;
            responses: string[];
        }>;
    }>;
}

// --- Scrolls ---
interface Scroll {
    title: string;
    text: string;
}

// --- Chat Provider ---
interface ChatProvider {
    url: string;
    model: string;
    format: 'openai' | 'anthropic';
    authHeader(key: string): Record<string, string>;
}

// --- NPC ---
interface NpcDef {
    emoji: string;
    name: string;
}

interface NpcPosition {
    r: number;
    c: number;
}

// --- INSEL Namespace ---
interface InselNamespace {
    [key: string]: any;
    on(event: string, handler: (data?: unknown) => void): void;
    off(event: string, handler: (data?: unknown) => void): void;
    emit(event: string, data?: unknown): void;
    register(name: string, module: unknown): void;
    version: string;
    debug(): { modules: string[]; listeners: string[]; version: string };
}

// --- Config ---
interface InselConfig {
    proxy?: string;
    proxyKey?: string;
    apiKey?: string;
    provider?: string;
    endpoint?: string;
    models?: Record<string, string>;
    [key: string]: unknown;
}

// --- Window Extensions ---
interface Window {
    INSEL: InselNamespace;
    INSEL_MATERIALS: MaterialMap;
    INSEL_STORAGE: InselStorage;
    INSEL_SOUND: InselSound;
    INSEL_ACHIEVEMENTS: AchievementMap;
    INSEL_QUEST_TEMPLATES: QuestTemplate[];
    INSEL_CRAFTING_RECIPES: Recipe[];
    INSEL_BLUEPRINTS: InselBlueprints;
    INSEL_AUTOMERGE: InselAutomerge;
    INSEL_HEALTHCHECK: InselHealthcheck;
    INSEL_SCREENSAVER: InselScreensaver;
    INSEL_NATURE: InselNature;
    INSEL_ELIZA: InselEliza;
    INSEL_SCROLLS: Scroll[];
    INSEL_CONFIG: InselConfig;

    // Cross-module functions
    grid: Grid;
    showToast(msg: string, duration?: number): void;
    requestRedraw(): void;
    questSystem: QuestSystem;
    addTokenBudget(charId: string, amount: number): void;
    getTokenBonus(charId: string): number;
    tryCharacterUnlock(): string | null;
    onCharacterUnlock(charId: string): void;
    openChat(npcId: string): void;
    requestAiComment(material: string, npcId: string, gridStats: GridStats): void;
    getMetrics(): unknown;
    getInselWishes(): unknown;
    recordMilestone(id: string): void;
    trackEvent(name: string, data?: Record<string, unknown>): void;
    codeZauber: unknown;
    isCodeViewActive(): boolean;
    webkitAudioContext: typeof AudioContext;
}
