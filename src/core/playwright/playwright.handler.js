const playwright = require('playwright');
const sessionManager = require('../sessions/sessionManager');
const logger = require('../../utils/logger');

/**
 * Lança o navegador Playwright de forma compatível com Linux headless (Railway).
 */
async function launchBrowser(browserTypeInput = 'chromium', launchOptions = {}, sessionId = null) {
  let effectiveApiBrowserType = browserTypeInput.toLowerCase();

  logger.log(`[Playwright] Browser solicitado: ${browserTypeInput}`);

  // 🚀 SEMPRE FORÇAR CHROMIUM EM CLOUD
  if (effectiveApiBrowserType === 'chrome') {
    logger.warn('[Playwright] Chrome detectado → mudando para "chromium" (compatível com Railway).');
    effectiveApiBrowserType = 'chromium';
  }

  if (!['chromium', 'firefox', 'webkit'].includes(effectiveApiBrowserType)) {
    logger.warn(`[Playwright] Tipo inválido '${browserTypeInput}' → usando chromium`);
    effectiveApiBrowserType = 'chromium';
  }

  // 🔥 CONFIGURAÇÃO HEADLESS + SAFE PARA CLOUD
  const defaultLaunchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--single-process',
      '--disable-gpu',
      '--no-zygote'
    ]
  };

  // SEÇÃO DE SESSÃO PERSISTENTE (FUNCIONA HEADLESS TBM)
  let userDataDirToUse;
  if (sessionId) {
    userDataDirToUse = sessionManager.getSessionDataPath('playwright', sessionId);
    sessionManager.ensureSessionPathExists('playwright', sessionId);
    logger.log(`[Playwright] Usando sessão persistente: ${sessionId}`);
  } else {
    const tempSessionId = `temp_playwright_${Date.now()}`;
    userDataDirToUse = sessionManager.getSessionDataPath('playwright', tempSessionId);
    sessionManager.ensureSessionPathExists('playwright', tempSessionId);
    logger.warn(`[Playwright] SessionId ausente → criando sessão temporária: ${tempSessionId}`);
  }

  const finalLaunchOptions = { ...defaultLaunchOptions, ...launchOptions };

  logger.log(`[Playwright] Iniciando contexto persistente (headless) com motor: ${effectiveApiBrowserType}`);

  // 🚀 AQUI ESTÁ A MAGIA → FUNCIONA NO RAILWAY
  const context = await playwright[effectiveApiBrowserType].launchPersistentContext(
    userDataDirToUse,
    finalLaunchOptions
  );

  let page = context.pages()[0] || await context.newPage();

  logger.log(`[Playwright] Contexto iniciado com sucesso.`);

  return { context, page };
}

async function closeContext(context) {
  if (context) {
    await context.close();
    logger.log('[Playwright] Contexto fechado.');
  }
}

async function saveSession(context, sessionId) {
  if (!sessionId) return;
  logger.log(`[Playwright] Sessão "${sessionId}" salva automaticamente.`);
}

module.exports = {
  launchBrowser,
  closeContext,
  saveSession,
};
