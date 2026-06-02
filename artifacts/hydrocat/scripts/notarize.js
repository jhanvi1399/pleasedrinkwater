/**
 * HydroCat — Apple Notarization Hook
 *
 * electron-builder calls this script as `afterSign` once the app is signed.
 * Notarization is OPTIONAL — the app will run without it, but macOS Gatekeeper
 * will show a warning for unnotarized apps distributed outside the Mac App Store.
 *
 * Prerequisites
 * ─────────────
 * 1. Enroll in the Apple Developer Program (https://developer.apple.com)
 * 2. Generate an app-specific password at https://appleid.apple.com
 * 3. Install `@electron/notarize`:
 *      pnpm --filter @workspace/hydrocat add -D @electron/notarize
 * 4. Set the following environment variables before running `pnpm ... run build`:
 *      APPLE_ID          your Apple ID email
 *      APPLE_APP_PASSWORD  the app-specific password you generated
 *      APPLE_TEAM_ID     your 10-character Team ID (from developer.apple.com)
 *      CSC_LINK          path to your .p12 certificate or a base-64 encoded string
 *      CSC_KEY_PASSWORD  password for the .p12 certificate
 *
 * Usage
 * ─────
 * Once the prerequisites above are met, uncomment the block below and run:
 *
 *   pnpm --filter @workspace/hydrocat run build
 *
 * electron-builder will sign → call this script → notarize → staple.
 */

'use strict';

exports.default = async function notarize(context) {
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') return;

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log(
      '[notarize] Skipping notarization — set APPLE_ID, APPLE_APP_PASSWORD, ' +
      'and APPLE_TEAM_ID to enable it.'
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`[notarize] Submitting ${appPath} for notarization…`);

  /*
   * Uncomment after installing @electron/notarize:
   *
   * const { notarize } = require('@electron/notarize');
   * await notarize({
   *   appBundleId: 'com.hydrocat.app',
   *   appPath,
   *   appleId,
   *   appleIdPassword,
   *   teamId,
   * });
   *
   * console.log('[notarize] Done.');
   */

  console.log(
    '[notarize] Notarization code is commented out. ' +
    'Install @electron/notarize and uncomment the block in scripts/notarize.js.'
  );
};
