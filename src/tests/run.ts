/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CLI entry point for `npm test`.
 * Runs the core game-engine suite and maps the failure count to the process
 * exit code so CI (and a local red/green check) actually fails on a broken rule.
 */
import { runCoreGameTests } from "./gameLogic.test";

const { failed } = runCoreGameTests();
process.exit(failed > 0 ? 1 : 0);
