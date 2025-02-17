import { css, CSSResultGroup, html, nothing, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators";
import { LovelaceBadgeConfig } from "../../../../data/lovelace/config/badge";
import { getBadgeElementClass } from "../../create-element/create-badge-element";
import type { LovelaceCardEditor, LovelaceConfigForm } from "../../types";
import { HuiElementEditor } from "../hui-element-editor";
import "./hui-badge-visibility-editor";

type Tab = "config" | "visibility";

@customElement("hui-badge-element-editor")
export class HuiBadgeElementEditor extends HuiElementEditor<LovelaceBadgeConfig> {
  @state() private _curTab: Tab = "config";

  protected async getConfigElement(): Promise<LovelaceCardEditor | undefined> {
    const elClass = await getBadgeElementClass(this.configElementType!);

    // Check if a GUI editor exists
    if (elClass && elClass.getConfigElement) {
      return elClass.getConfigElement();
    }

    return undefined;
  }

  protected async getConfigForm(): Promise<LovelaceConfigForm | undefined> {
    const elClass = await getBadgeElementClass(this.configElementType!);

    // Check if a schema exists
    if (elClass && elClass.getConfigForm) {
      return elClass.getConfigForm();
    }

    return undefined;
  }

  private _handleTabSelected(ev: CustomEvent): void {
    if (!ev.detail.value) {
      return;
    }
    this._curTab = ev.detail.value.id;
  }

  private _configChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    this.value = ev.detail.value;
  }

  protected renderConfigElement(): TemplateResult {
    const displayedTabs: Tab[] = ["config", "visibility"];

    let content: TemplateResult<1> | typeof nothing = nothing;

    switch (this._curTab) {
      case "config":
        content = html`${super.renderConfigElement()}`;
        break;
      case "visibility":
        content = html`
          <hui-badge-visibility-editor
            .hass=${this.hass}
            .config=${this.value}
            @value-changed=${this._configChanged}
          ></hui-badge-visibility-editor>
        `;
        break;
    }
    return html`
      <paper-tabs
        scrollable
        hide-scroll-buttons
        .selected=${displayedTabs.indexOf(this._curTab)}
        @selected-item-changed=${this._handleTabSelected}
      >
        ${displayedTabs.map(
          (tab, index) => html`
            <paper-tab id=${tab} .dialogInitialFocus=${index === 0}>
              ${this.hass.localize(
                `ui.panel.lovelace.editor.edit_badge.tab_${tab}`
              )}
            </paper-tab>
          `
        )}
      </paper-tabs>
      ${content}
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      HuiElementEditor.styles,
      css`
        paper-tabs {
          --paper-tabs-selection-bar-color: var(--primary-color);
          color: var(--primary-text-color);
          text-transform: uppercase;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--divider-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-badge-element-editor": HuiBadgeElementEditor;
  }
}
