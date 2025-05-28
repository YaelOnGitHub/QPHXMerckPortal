import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {

  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  load(scriptUrl: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = scriptUrl;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  loadInlineScript(content: string, id: string): void {
    if (document.getElementById(id)) {
      return;
    }

    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.id = id;
    script.text = content;
    this.renderer.appendChild(document.body, script);
  }
}
