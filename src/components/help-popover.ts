export class HelpPopover extends HTMLElement {
  connectedCallback() {
    const content = this.innerHTML;
    
    this.innerHTML = `
      <style>
        help-popover {
          display: contents;
        }
      </style>
      <article class="instructions" id="help-popover" popover>
        <header>
          <h2>Instructions & Features</h2>
          <button type="button" popovertarget="help-popover" popovertargetaction="close">Close</button>
        </header>
        ${content}
      </article>
    `;
  }
}

customElements.define('help-popover', HelpPopover);