import Tool from "./Tool";
import Vector from "../math/Vector";
import CanvasLayer from "../CanvasLayer";
import Rect from "../utils/Rect";
import {imageStorage} from "../storage/ImageStorage";
import * as Utils from "../utils/Utils";
import {PaintView, IPointerData} from "../views/PaintView";
import {config} from "../config";
import {saveAs} from "file-saver";
import SendPalette from "../palettes/SendPalette";
import { dropboxStorage } from "../storage/DropboxStorage";

// Provides a floating selection the user can manipulate 
export default class SelectionTool extends Tool {
    readonly selectionLayerId = "selection-layer";

    get selectionLayer(): CanvasLayer { return <CanvasLayer>this._painter.getLayer(this.selectionLayerId) }
    get selection(): Rect { return this._selection; }
    get hasFloatingSelection(): boolean { return this._hasFloatingSelection; }
    set hasFloatingSelection(value: boolean) { 
        this._hasFloatingSelection = value;
        this.toggleFloatingSelectionButtons(value);
    }
    get isInShapesPalette(): boolean { return this._isInShapesPalette; }
    set isInShapesPalette(value: boolean) { 
        this._isInShapesPalette = value;
        this._saveButton.classList.toggle("disabled", value);
    }
    
    protected _position: Vector;
    protected _startPosition: Vector;
    protected _selection: Rect = Rect.Empty();
    private _hasFloatingSelection: boolean;
    private _drawSelectionOutlineRequested: boolean;
    private _isInShapesPalette: boolean;
    private _deleteButton: HTMLDivElement;
    private _stampButton: HTMLDivElement;
    private _saveButton: HTMLDivElement;
    private _downloadButton: HTMLDivElement;
    private _sendPalette: SendPalette;

    constructor(painter: PaintView, buttonId: string) {
        super(painter, buttonId);
        this._deleteButton = <HTMLDivElement>document.getElementById("selection-delete-button");
        Utils.addClick(this._deleteButton, () => this.clearSelection());
        this._stampButton = <HTMLDivElement>document.getElementById("selection-stamp-button");
        Utils.addClick(this._stampButton, () => this.paintSelectionToCanvas());
        this._saveButton = <HTMLDivElement>document.getElementById("selection-save-button");
        Utils.addClick(this._saveButton, () => this.saveSelectionAsNewShape());
        this._downloadButton = <HTMLDivElement>document.getElementById("selection-download-button");
        Utils.addClick(this._downloadButton, () => {
            this.selectionLayer.canvas.toBlob(blob => saveAs(blob, "image.png"));
        });
        
        this._sendPalette = new SendPalette("send-palette");
        this._sendPalette.onSelectionChanged = (receipient: string) => {
            this.selectionLayer.canvas.toBlob(async blob => {
                if (await dropboxStorage.sendGift(blob, receipient)){
                    this._sendPalette.bounce();
                } else {
                    this._sendPalette.shake();
                }
            });
        }
        
        this.hasFloatingSelection = false;
        this._position = new Vector(0, 0);
    }
    
    toggleFloatingSelectionButtons(visible: boolean){
        this._deleteButton.classList.toggle("hidden", !visible);
        this._stampButton.classList.toggle("hidden", !visible);
        this._downloadButton.classList.toggle("hidden", !visible);
        this._saveButton.classList.toggle("hidden", !visible);
        this._sendPalette.setVisible(visible);
    }

    enable() {
        super.enable();
        this.createSelectionLayer();
        this.hasFloatingSelection = false;
        this.isInShapesPalette = false;
    }

    disable() {
        super.disable();
        this.paintSelectionToCanvas();
        this.destroySelectionLayer();
        this.hasFloatingSelection = false;
    }
    
    down(data: IPointerData) {
        this._position = this.getClampedPosition(data);
        this.startNewSelection();
    }

    move(data: IPointerData): void {
        this._position = this.getClampedPosition(data);
        this.requestDrawSelectionOutline();
    }

    up(data: IPointerData): void {
        this.cutSelection();
    }

    private startNewSelection() {
        this.paintSelectionToCanvas();
        this.selectionLayer.setPositionAndSize(0, 0, this._painter.width, this._painter.height);
        this.selectionLayer.transform(new Vector(0, 0), 1, 0);
        this.selectionLayer.floating = false;

        this.hasFloatingSelection = false;
        this.isInShapesPalette = false;
        this._startPosition = this._position;
        
        let ctx = this.selectionLayer.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.strokeStyle = "black";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        this.requestDrawSelectionOutline();
    }

    private getClampedPosition(data: IPointerData) {
        return data.position.round().clamp(0, 0, this._painter.width - 1, this._painter.height - 1);
    }

    tick(delta: number) {
        if (this._drawSelectionOutlineRequested) {
            this.updateSelectionAndDrawOutline();
            this._drawSelectionOutlineRequested = false;
        }
    }
    
    keyDown(event: KeyboardEvent) {
        switch (event.code){
            case 'Backspace':
                this.clearSelection();
                break;
            // case 'KeyC':
            //     if (event.metaKey){
            //         this.copyToClipboard();
            //     }
            //     break;
        }
    }

    private clearSelection() {
        this.selectionLayer.clear();
        this.startNewSelection();
    }

    setImage(image: HTMLImageElement){
        this.hasFloatingSelection = true;
        this.selectionLayer.resize(image.width, image.height);
        this.selectionLayer.floating = true;
        this.selectionLayer.drawImage(image);
        this.isInShapesPalette = true;
    }

    async setImageUrl(url: string): Promise<HTMLImageElement>{
        const img = new Image();
        img.src = url;
        return new Promise(resolve => {
            img.onload = () => {
                this.setImage(img);
                resolve(img);
            }
        });
    }

    async setImagePath(path: string): Promise<HTMLImageElement>{
        const url = await imageStorage.loadImageUrl(path);
        return this.setImageUrl(url);
    }

    private requestDrawSelectionOutline() {
        this._drawSelectionOutlineRequested = true;
    }

    private updateSelectionAndDrawOutline() {
        if (this.hasFloatingSelection){
            return;
        }
        this.selectionLayer.clear();
        let ctx = this.selectionLayer.ctx;

        const x = Math.min(this._startPosition.x, this._position.x);
        const y = Math.min(this._startPosition.y, this._position.y);
        const width = Math.abs(this._startPosition.x - this._position.x);
        const height = Math.abs(this._startPosition.y - this._position.y);
        this._selection = new Rect(x, y, width, height);

        ctx.strokeRect(x, y, width, height);
    }
    
    private destroySelectionLayer() {
        this._painter.removeLayer(this.selectionLayer);
    }

    private createSelectionLayer() {
        if (this.selectionLayer){
            return;
        }

        this._painter.addCanvasLayer(this.selectionLayerId, 0, 0, this._painter.width, this._painter.height, false);
        this.selectionLayer.onDoubleTap = (event: TouchEvent) => {
            if (event.altKey){
                this.saveSelectionAsNewShape();
                return;
            }
            this.paintSelectionToCanvas();
        }
    }
    
    private cutSelection() {
        this.selectionLayer.clear();
        this._selection = Utils.getVisiblePixelFrame(this._painter.baseLayer.ctx, this.selection);
        
        if (this.selection.isEmpty()){
            return;
        }

        this.hasFloatingSelection = true;
        const {x, y, width, height} = this.selection;
        
        this.selectionLayer.setPositionAndSize(x, y, width, height);
        this.selectionLayer.floating = true;
        this.selectionLayer.ctx.drawImage(this._painter.baseLayer.canvas, x, y, width, height, 0, 0, width, height);
        this._painter.baseLayer.clear(this.selection);
        this._painter.recordHistoryState();
    }

    private paintSelectionToCanvas() {
        if (!this.hasFloatingSelection){
            return;
        }
        this._painter.baseLayer.ctx.globalCompositeOperation = "source-over";
        this.selectionLayer.drawToCanvas(this._painter.baseLayer.ctx);
        this._painter.recordHistoryState();
    }

    private async saveSelectionAsNewShape() {
        const shapes = await imageStorage.listFolder("user/shapes");
        if (shapes.length >= config.maxShapeCount){
            console.log("Cannot save selection as shape because there are already too many in storage.");
            return;
        }
        
        const path = `user/shapes/${Date.now()}.png`;
        console.log(`Saving selection as: ${path}`);
        this.selectionLayer.canvas.toBlob(blob => imageStorage.saveImage(path, blob as Blob));
        this.isInShapesPalette = true;
    }

    // copyToClipboard(){
    //     this.selectionLayer.canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
    //     console.log("copied selection to clipboard");
    // }
    //
    // pasteFromClipboard() {
    //     navigator.permissions.query({name: "clipboard-read"})
    //         .then(result => {
    //             if (!(result.state == "granted" || result.state == "prompt")) {
    //                 return;
    //             }
    //             navigator.clipboard.read()
    //                 .then(data => {
    //                     for (let i = 0; i < data.length; i++) {
    //                         if (!data[i].types.includes("image/png")){
    //                             continue;
    //                         }
    //                         data[i].getType("image/png")
    //                             .then(blob => {
    //                                 this.setImageUrl(URL.createObjectURL(blob));
    //                             })
    //                     }
    //                 });
    //         });
    // }

    selectAll() {
        this.startNewSelection();
        this._selection = new Rect(0, 0, this._painter.width, this._painter.height);
        this.cutSelection();
    }
}
