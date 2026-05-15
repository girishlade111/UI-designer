/**
 * Layout type for generated screens.
 */
export type LayoutType = 'mobile' | 'web';

/**
 * A single generated or edited screen within a project.
 */
export type Screen = {
  /**
   * Unique identifier (uuid generated client-side with crypto.randomUUID()).
   */
  id: string;

  /**
   * Name of the screen (e.g. "Login", "Dashboard", "Checkout").
   */
  name: string;

  /**
   * Complete HTML string with inline CSS representing the screen's UI.
   */
  htmlContent: string;

  /**
   * Visual order of the screen on the canvas (1, 2, 3...).
   */
  displayOrder: number;

  /**
   * Array of previous htmlContent values used for undo functionality.
   */
  editHistory: string[];
};

/**
 * A prototype click connection between two screens.
 */
export type Connection = {
  /**
   * Unique identifier for the connection.
   */
  id: string;

  /**
   * The ID of the screen where the connection starts.
   */
  fromScreenId: string;

  /**
   * The ID of the screen where the connection leads to.
   */
  toScreenId: string;

  /**
   * CSS selector or description indicating what triggers the connection (e.g., "Login button").
   */
  triggerElement: string;
};

/**
 * The full project state stored in localStorage and React state.
 */
export type Project = {
  /**
   * Unique identifier for the project (uuid).
   */
  id: string;

  /**
   * Name of the project, auto-generated from the first 5 words of the prompt.
   */
  name: string;

  /**
   * The original text prompt the user typed to generate the project.
   */
  originalPrompt: string;

  /**
   * The layout type selected for the project (mobile or web).
   */
  layoutType: LayoutType;

  /**
   * Array of screens belonging to the project.
   */
  screens: Screen[];

  /**
   * Array of connections defining prototyping navigation between screens.
   */
  connections: Connection[];

  /**
   * ISO date string representing when the project was created.
   */
  createdAt: string;

  /**
   * ISO date string representing the last time the project was updated.
   */
  updatedAt: string;
};

/**
 * API request type for /api/generate endpoint.
 */
export type GenerateRequest = {
  /**
   * The prompt describing the project to generate.
   */
  prompt: string;

  /**
   * The requested layout type (mobile or web).
   */
  layoutType: LayoutType;
};

/**
 * API response type for /api/generate endpoint.
 */
export type GenerateResponse = {
  /**
   * A record mapping screen names to their generated HTML content.
   */
  screens: { [screenName: string]: string };

  /**
   * Optional error message if the generation failed.
   */
  error?: string;
};

/**
 * API request type for /api/edit endpoint.
 */
export type EditRequest = {
  /**
   * The current HTML content of the screen to be edited.
   */
  currentHtml: string;

  /**
   * The instruction on how to modify the HTML content.
   */
  instruction: string;
};

/**
 * API response type for /api/edit endpoint.
 */
export type EditResponse = {
  /**
   * The updated HTML content after applying the edit instruction.
   */
  updatedHtml: string;

  /**
   * Optional error message if the edit failed.
   */
  error?: string;
};
