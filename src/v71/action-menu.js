(()=>{'use strict';
/* v75 compatibility shim. The old v71 implementation physically moved feature buttons
   into the native FAB DOM. That caused race conditions with later modules and could hide
   or orphan actions. v75 header-cleanup owns presentation; original feature controls stay
   in place and are invoked through safe proxy buttons. */
const BUILD='75';
function tidy(){window.FocusCalHeaderCleanup?.clean?.()}
window.FocusCalActionMenu={tidy,build:BUILD,legacyMoverDisabled:true};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tidy,0),{once:true});else setTimeout(tidy,0);
})();