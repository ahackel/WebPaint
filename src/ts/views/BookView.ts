import {View} from "./View";
import {config} from "../config";
import Thumbnail from "./Thumbnail";
import PeerToPeer from "../PeerToPeer";
import * as Utils from "../utils/Utils";
import {imageStorage} from "../storage/ImageStorage";


export default class BookView extends View {

    public onImageSelected: Function | undefined;
    private _thumbnails: Thumbnail[];
    
    constructor(id: string, onSettingsClicked: Function) {
        super(id);
        let settingsButton = <HTMLDivElement>this._element.getElementsByClassName("button settings")[0];
        Utils.addClick(settingsButton, () => onSettingsClicked());
    }

    show(): void {
        super.show();
        this.updateImages();
        
        // PeerToPeer.instance.onDataReceived = (data: ArrayBuffer) => {
        //     this._thumbnails[0].setImageSrc(URL.createObjectURL(new Blob([data])));
        // }
    }

    private updateImages() {
        if (this._thumbnails){
            return;
        }
        
        this._thumbnails = [];
        
        for (let i=0; i<config.imageCount; i++) {
            const imageId = imageStorage.getImagePath(i);
            let thumbnail = new Thumbnail(this._element, imageId, (id: string) => this.onImageSelected(id))
            this._thumbnails.push(thumbnail);
        }
    }
}
