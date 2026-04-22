// === Zentrale Typdefinitionen für Schatzinsel ===
// Kein Build-Schritt nötig — wird nur von tsconfig.json + Editor genutzt.

// --- Material ---
interface Material {
    emoji: string;
    label: string;
    color: string;
    border: string;
    charge?: number;
    mass?: number;            // Spielphysik-Masse (Blackhole/Curvature) — NICHT Atommasse
    spin?: number;            // Bosonen
    unbaubar?: boolean;
    ordnungszahl?: number;    // Periodensystem Z (Anzahl Protonen)
    atomicMass?: number;      // Periodensystem A (Nukleonen = Z + N)
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
    materialsFound?: number;
    wuXingUsed?: number;
    recipesUsed?: number;
    florianeWishes?: number;
    bugsReported?: number;
    npcsSpokenTo?: number;
    npcCount?: number;
    darkModeUsed?: boolean;
    idleMinutes?: number;
    sessionPlaced?: number;
}

// --- Quests ---
interface QuestTemplate {
    npc: string;
    title: string;
    desc: string;
    needs: Record<MaterialId, number>;
    reward: string;
    community?: boolean; // Trotzki: Gemeinschaftsquest — alle NPCs profitieren
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

interface InselEffects {
    updateDayNight(): void;
    getDayNightOverlay(): string | null;
    getDayTime(): number;
    drawWeather(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
    updateWeather(): void;
    addPlaceAnimation(r: number, c: number): void;
    drawAnimations(ctx: CanvasRenderingContext2D, CELL_SIZE: number, WATER_BORDER: number): void;
    spawnCraftSparks(): void;
    spawnMergeSparks(cells: Array<[number, number]>, opts: {
        canvas: HTMLCanvasElement;
        COLS: number;
        WATER_BORDER: number;
        extraClass?: string;
        duration?: number;
    }): void;
    flyToInventory(fromEl: HTMLElement, emoji: string): void;
    setWeather(w: string): void;
    getWeather(): string;
    resetWeatherTimer(): void;
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


// --- TTS ---
interface VoiceInfo {
    voice: string;
    lang: string;
}

interface InselTTS {
    readonly hoerspielSpeaking: boolean;
    stripForTTS(text: string): string;
    stopHoerspiel(): void;
    detectVoice(line: string): VoiceInfo;
    speakCloudTTS(text: string, voiceInfo: VoiceInfo): Promise<void>;
    speakLines(lines: string[], onDone?: () => void): void;
    maybeHoerspiel(stats: GridStats): void;
}

// --- Save Context ---
interface InselSaveContext {
    ROWS: number;
    COLS: number;
    getGrid(): Grid;
    setGrid(g: Grid): void;
    getTreeGrowth(): Record<string, number>;
    setTreeGrowth(tg: Record<string, number>): void;
    getInventory(): Record<string, number>;
    setInventory(inv: Record<string, number>): void;
    getUnlockedMaterials(): Set<string>;
    setUnlockedMaterials(s: Set<string>): void;
    getDiscoveredRecipes(): Set<string>;
    setDiscoveredRecipes(s: Set<string>): void;
    getPlayerPos(): { r: number; c: number } | null;
    resetPlayerPos(): void;
    getMaterials(): MaterialMap;
    getProjectName(): string;
    setProjectName(n: string): void;
    initGrid(): void;
    saveInventory(): void;
    saveUnlocked(): void;
    saveDiscoveredRecipes(): void;
    setWindowGrid(): void;
    migrateUnlocked(): void;
    updateStats(): void;
    updateInventoryDisplay(): void;
    updatePaletteVisibility(): void;
    updateGenesisVisibility(): void;
    updateDiscoveryCounter(): void;
    requestRedraw(): void;
    requestStatsUpdate(): void;
    resetGenesisFlags(): void;
}

interface InselSave {
    AUTOSAVE_KEY: string;
    registerContext(ctx: InselSaveContext): void;
    isValidGrid(g: unknown): boolean;
    saveProject(): void;
    autoSave(): void;
    showLoadDialog(): void;
    loadProject(name: string): void;
    deleteProject(name: string): void;
    newProject(): void;
    encodeGridToURL(): string;
    decodeGridFromURL(encoded: string): boolean;
}

// --- HexGrid ---
interface HexCell {
    surface: string | null;
    height: number;
    dark: number;
    trixels: null | Array<{ material: string | null; depth: number; dark: number }>;
}

interface HexGrid {
    cells: Map<string, HexCell>;
    radius: number;
    get(q: number, r: number): HexCell | undefined;
    set(q: number, r: number, cell: HexCell): void;
    neighbors(q: number, r: number): Array<[number, number]>;
    hexToPixel(q: number, r: number, size: number): { x: number; y: number };
    pixelToHex(x: number, y: number, size: number): { q: number; r: number };
    forEach(fn: (cell: HexCell, q: number, r: number) => void): void;
}

interface Trixel {
    material: string | null;
    depth: number;
    dark: number;
}

interface InselHex {
    createGrid(radius: number): HexGrid;
    migrateCell(value: string | HexCell | unknown): HexCell;
    createTrixels(cell: { surface: string | null; height?: number; dark?: number } | null): Trixel[];
    setTrixel(cell: HexCell, idx: number, material: string | null, depth: number, dark?: number): void;
    mergeTrixels(cell: HexCell): { merged: boolean; count: number };
    hasTrixels(cell: HexCell): boolean;
    emptyTrixel(): Trixel;
    DIRECTIONS: Array<[number, number]>;
    hexKey(q: number, r: number): string;
}

// --- HexRenderer ---
interface InselHexRenderer {
    drawHexGrid(ctx: CanvasRenderingContext2D, grid: HexGrid, size: number, offsetX: number, offsetY: number, materials: MaterialMap): void;
    drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cell: HexCell, materials: MaterialMap): void;
    drawTrixelFill(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cell: HexCell, materials: MaterialMap): void;
    drawTrixelOverlay(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cell: HexCell): void;
    hitTest(mouseX: number, mouseY: number, grid: HexGrid, size: number, offsetX: number, offsetY: number): { q: number; r: number };
    ISO_FACTOR: number;
    HEIGHT_PX: number;
}

// --- Marble ---
interface Marble {
    q: number;
    r: number;
    active: boolean;
    path: Array<{ q: number; r: number }>;
    speed: number;
    steps: number;
}

interface InselMarble {
    createMarble(q: number, r: number): Marble;
    tickMarble(marble: Marble, grid: HexGrid): void;
    animateMarble(marble: Marble, grid: HexGrid, onTick?: (marble: Marble) => void, onDone?: (marble: Marble) => void): ReturnType<typeof setInterval>;
    TICK_MS: number;
}

// --- QuadTrixel (Quad-Grid-Trixel-Bridge, Sidecar-Storage) ---
interface QuadTrixel {
    material: string | null;
    depth: number;
    dark: number;
}

interface InselQuadTrixel {
    hasAt(r: number, c: number): boolean;
    getAt(r: number, c: number): QuadTrixel[] | null;
    initAt(r: number, c: number, material?: string | null, depth?: number): void;
    setTrixel(r: number, c: number, idx: number, material: string | null, depth?: number, dark?: number): void;
    mergeAt(r: number, c: number): { merged: boolean; count: number };
    clearAt(r: number, c: number): void;
    clear(): void;
    count(): number;
    drawQuadTrixels(ctx: CanvasRenderingContext2D, x: number, y: number, tileW: number, tileH: number, trixels: QuadTrixel[], materials: MaterialMap): void;
    snapshot(): Array<{ r: number; c: number; trixels: QuadTrixel[] }>;
}

// --- ParticleSnap ---
interface SnapParticle {
    id: number;
    material: MaterialId;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseSize: number;
    born: number;
    ttl: number;
    dead: boolean;
}

interface SnapSpawnOpts {
    vx?: number;
    vy?: number;
    size?: number;
    ttl?: number;
}

interface InselParticleSnap {
    spawn(material: MaterialId, x: number, y: number, opts?: SnapSpawnOpts): SnapParticle;
    update(dtMs?: number): { moved: number; merged: number; dead: number };
    draw(ctx: CanvasRenderingContext2D, materials?: MaterialMap): void;
    clear(): void;
    count(): number;
    snapshot(): SnapParticle[];
    _setGravity(g: number): void;
    _setDamping(d: number): void;
    _lookupMergeResult(a: MaterialId, b: MaterialId): MaterialId | null;
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
    INSEL_EFFECTS: InselEffects;
    INSEL_SCROLLS: Scroll[];
    INSEL_CONFIG: InselConfig;

    INSEL_TTS: InselTTS;
    INSEL_SAVE: InselSave;
    INSEL_STORIES: Record<string, string[]> & {
        CODE_EASTER_EGGS: Record<string, string[]>;
        maybeCodeEasterEgg(material: string, showToast?: Function, recordMilestone?: Function, trackEvent?: Function): boolean;
        getDiscoveredEggs(): string[];
    };
    INSEL_CHARACTERS: Record<string, unknown>;
    INSEL_HEX: InselHex;
    INSEL_HEX_RENDERER: InselHexRenderer;
    INSEL_MARBLE: InselMarble;
    INSEL_QUAD_TRIXEL: InselQuadTrixel;
    INSEL_PARTICLE_SNAP: InselParticleSnap;
    INSEL_BUS: InselNamespace;
    INSEL_DIMS: { ROWS: number; COLS: number };
    startSessionClock?(): void;
    soundAchievement?(): void;
    resetIdleTimer?(): void;

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
    INSEL_TUTORIAL: {
        open(): void;
        close(): void;
        isActive(): boolean;
        getLessons(): unknown[];
        getProgress(): number;
        resetProgress(): void;
    };
    isCodeViewActive(): boolean;
    webkitAudioContext: typeof AudioContext;
    // Flat TTS exports (tts.js)
    stripForTTS(text: string): string;
    stopHoerspiel(): void;
    detectVoice(line: string): VoiceInfo;
    speakCloudTTS(text: string, voiceInfo: VoiceInfo): Promise<void>;
    speakLines(lines: string[], onDone?: () => void): void;
    maybeHoerspiel(stats: GridStats): void;

    // Flat Save exports (save.js)
    autoSave(): void;
    showLoadDialog(): void;
    isValidGrid(g: unknown): boolean;
    loadProject(name: string): void;
    deleteProject(name: string): void;
    newProject(): void;
    encodeGridToURL(): string;
    decodeGridFromURL(encoded: string): boolean;

    // Seed system (seed.js)
    INSEL_SEED?: {
        cyrb53(str: string, seed?: number): number;
        mulberry32(seed: number): () => number;
        seedToRng(seedText: string): () => number;
        getSeedFromURL(): string | null;
        getLastSeed(): string;
        saveSeedWorld(seedText: string, snapshot: Record<string, unknown>): void;
        loadSeedWorld(seedText: string): Record<string, unknown> | null;
    };
    currentSeed?: string;
    INSEL_GENERATORS: {
        generateStarterIsland(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap): void;
        generateLummerland(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap, rng?: () => number): void;
        generateDinoIsland(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap): void;
        generateMoonIsland(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap): void;
        generateMarsIsland(grid: Grid, ROWS: number, COLS: number, MATERIALS: MaterialMap): void;
        generateWaterStart(grid: Grid, ROWS: number, COLS: number): void;
    };

}
