import {View} from "./View";
import Utils from "./Utils";

export class Palette extends View {
    public onSelectionChanged: Function | undefined;
    private _selectedElement: HTMLDivElement;
    private _optionsElement: HTMLDivElement;
    private _options: string[];
    private _selectedIndex: number;
    
    private static _expandedPalette: Palette;

    get selectedIndex(){ return this._selectedIndex }
    set selectedIndex(value){
        this._selectedIndex = value;
        this.updateOption(this._selectedElement, this.selectedOption);
    }
    get selectedOption(){ return this._options[this._selectedIndex] }
    get isCollapsed(){ return this._element.classList.contains("collapsed") }

    constructor(id: string, options: any[], rightAlign: boolean = false) {
        super(id);
        this._options = options;
        this._selectedIndex = 0;

        this.addSelectedOption();
        this.addOptions();

        this.show();
        this.collapse();
    }
    
    static collapseAll() {
        if (Palette._expandedPalette){
            Palette._expandedPalette.collapse();
        }
    }

    collapse() {
        this._element.classList.add("collapsed");
        if (Palette._expandedPalette == this){
            Palette._expandedPalette = null;
        }
    }

    expand() {
        Palette.collapseAll();
        this._element.classList.remove("collapsed");
        Palette._expandedPalette = this;
    }

    toggle() {
        if (this.isCollapsed){
            this.expand();
        }
        else {
            this.collapse();
        }
    }

    addSelectedOption() {
        let element = <HTMLDivElement>document.createElement("div");
        element.classList.add("option");
        this._selectedElement = element;
        Utils.addFastClick(element, () => this.toggle());
        this.updateOption(element, this.selectedOption);
        this._element.appendChild(element);
    }

    addOptions(){
        let element = <HTMLDivElement>document.createElement("div");
        element.classList.add("options");
        element.style.width = Math.min(4, this._options.length) * 50 + "px";
        element.style.top = Math.ceil(this._options.length / 4) * -25 + 20 + "px";
        this._optionsElement = element;

        this.addArrow();

        let i: number = 0;
        for (let option of this._options){
            this.addOption(i, option);
            i ++;
        }
        this._element.appendChild(element);
    }

    addArrow(){
        let element = <HTMLDivElement>document.createElement("div");
        element.classList.add("arrow");
        this._optionsElement.appendChild(element);
    }

    addOption(index: number, option: any) {
        let element = <HTMLDivElement>document.createElement("div");
        element.classList.add("option");
        Utils.addFastClick(element, () => {
            this.selectedIndex = index;
            this.collapse();
            if (this.onSelectionChanged) {
                this.onSelectionChanged(option, index);
            }
        });
        this.updateOption(element, option);
        this._optionsElement.appendChild(element);
    }

    updateOption(element: HTMLDivElement, option: any){
    }
}