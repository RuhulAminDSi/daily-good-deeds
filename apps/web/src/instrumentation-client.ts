import { persistIfInstalled } from './lib/capabilities';
import { initErrorReporting } from './lib/error-reporting';
import { captureInstallPrompt } from './lib/install-prompt';

initErrorReporting();
// Before hydration: the browser fires its install event once, possibly early.
captureInstallPrompt();
// Installed apps keep their offline data under storage pressure.
void persistIfInstalled();
