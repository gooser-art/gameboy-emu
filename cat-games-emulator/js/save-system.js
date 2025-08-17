(function(){
  'use strict';
  const KEY_PREFIX = 'cat-emu:';
  function key(k){ return KEY_PREFIX + k; }
  const SaveSystem = {
    save(name, data){ try { localStorage.setItem(key(name), JSON.stringify(data)); return true; } catch { return false; } },
    load(name){ try { const v = localStorage.getItem(key(name)); return v? JSON.parse(v): null; } catch { return null; } },
    remove(name){ try { localStorage.removeItem(key(name)); return true; } catch { return false; } }
  };
  window.SaveSystem = SaveSystem;
})();
