export class ModuleSection extends HTMLElement {
  connectedCallback() {
    const id = this.getAttribute('id') || '';
    const title = this.getAttribute('title') || '';
    const instructionsId = `${id}-instructions`;
    
    // Get instruction content from slot
    const instructionSlot = this.querySelector('[slot="instructions"]');
    const contentSlot = this.querySelector('[slot="content"]');
    
    this.innerHTML = `
      <style>
        module-section {
          display: block;
        }
      </style>
      <section class="module" id="${id}">
        <header>
          <h2>${title}</h2>
          <button type="button" popovertarget="${instructionsId}">Instructions</button>
        </header>

        <article class="instructions" id="${instructionsId}" popover>
          <header>
            <h3>${title}</h3>
            <button type="button" popovertarget="${instructionsId}" popovertargetaction="close">Close</button>
          </header>
          ${instructionSlot?.innerHTML || ''}
        </article>

        ${contentSlot?.innerHTML || ''}
      </section>
    `;
  }
}

customElements.define('module-section', ModuleSection);