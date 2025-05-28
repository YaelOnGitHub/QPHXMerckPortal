import { Injectable } from '@angular/core';

export const ScriptStore = [
  { name: 'merckCookie', 
    src: 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', 
    dataDomainScript: '0195b230-b8ea-7f4e-8251-539a080f23f6'  // Added data-domain-script
  },
];

@Injectable({
  providedIn: 'root'
})
export class CookieConsetService {
  private scripts: any = {};

  constructor() {  
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src,
        dataDomainScript: script.dataDomainScript  // Store dataDomainScript
      };
    });
  }

  load(...scripts: string[]) {
    let promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      // Resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // Load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;

        // Add the data-domain-script attribute
        if (this.scripts[name].dataDomainScript) {
          script.setAttribute('data-domain-script', this.scripts[name].dataDomainScript);
        }

        // Onload handler
        script.onload = () => {
          this.scripts[name].loaded = true;
          
          // Call OptanonWrapper after script is loaded
          if (typeof window['OptanonWrapper'] === 'function') {
            window['OptanonWrapper']();
          }

          resolve({ script: name, loaded: true, status: 'Loaded' });
        };

        // Onerror handler
        script.onerror = (error: any) => {
          resolve({ script: name, loaded: false, status: 'Load Error' });
        };

        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
