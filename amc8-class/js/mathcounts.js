// MATHCOUNTS tab: loads the Mathlete Daily Coach engine (../../lib, shared with the Chrome
// extension in this repo) and hands it to the app as window.MC. Its state lives inside the
// kid's Math Hoops state (S.mc), so it saves to the family account like everything else.
import * as engine from '../../lib/engine.js';
import { TOPICS, TOPIC_BY_ID } from '../../lib/topics.js';
import { installBridge } from './mc-bridge.js';

window.MC = { ...engine, TOPICS, TOPIC_BY_ID };
// More kinds of AMC 8 questions per topic, borrowed from the coach (js/mc-bridge.js).
try { installBridge(window.TOPICS); } catch (e) { console.warn('Extra question types not loaded', e); }
window.dispatchEvent(new Event('mc-ready'));
