import { isBrowser } from '../env';
import * as browser from './browser';
import * as node from './node';

const validModule = isBrowser ? browser : node;

export { BOLD, UNBOLD, BLUE, GREY, GREEN, RED, PURPLE, ORANGE, UNCOLOR } from './common';

export const print = validModule.print;
export const warn = validModule.warn;
export const printError = validModule.printError;
export const printImg = validModule.printImg;
export const printImgBase64 = validModule.printImgBase64;
export const group = validModule.group;
export const groupCollapsed = validModule.groupCollapsed;
export const groupEnd = validModule.groupEnd;
export const printDom = validModule.printDom;
export const printCanvas = validModule.printCanvas;
export const createVConsole = validModule.createVConsole;
export const createModuleLogger = validModule.createModuleLogger;

export const browserVConsoles = browser.vconsoles; 
export const BrowserVConsole = browser.VConsole;

