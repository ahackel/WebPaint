import * as Utils from "../utils/Utils";
import {imageStorage} from "../storage/ImageStorage";

export default class Thumbnail {
    
    private _element: HTMLDivElement;
    private _imageUrl: string;
    private _overlayUrl: string;
    
    get path() { return this._element.id; }
    set imageUrl(src: string){
        this._imageUrl = src;
        this._element.style.opacity = "1";
        this.updateBackgroundImages();
    }
    set overlayUrl(src: string){
        this._overlayUrl = src;
        this.updateBackgroundImages();
    }

    constructor(parent: HTMLElement, path: string, onImageSelected: Function | undefined) {
        let element = <HTMLDivElement>document.createElement("div");
        this._element = element;
        element.id = path;
        element.classList.add("thumbnail");
        this._element.style.opacity = "0";
        
        // Utils.addLongClick(element, () => {
        //     if (!this._image || !PeerToPeer.instance || !PeerToPeer.instance.loggedIn || PeerToPeer.instance.peerList.length < 2){
        //         return;
        //     }
        //
        //     Utils.imageToBlob(this._image)
        //         .then(blob => {
        //             const peerName = PeerToPeer.instance.peerList[1];
        //             PeerToPeer.instance.sendData(peerName, blob);
        //         });
        // });
        
        Utils.addClick(element, () => {
            if (onImageSelected) {
                onImageSelected(path);
            }
        }, true);

        imageStorage.addChangeListener((change: string, path: string) => {
            if (path == this.path || path == imageStorage.getOverlayPath(this.path)) {
                this.loadImage();
            }
        });
        
        parent.appendChild(element);
        this.loadImage();
    }

    remove() {
        this._element.remove();
    }
    
    private isHidden() {
        return (this._element.offsetParent === null)
    }

    private loadImage() {
        imageStorage.loadImageUrl(this.path)
            .then(url => {
                this.imageUrl = url;
            });
        imageStorage.loadImageUrl(imageStorage.getOverlayPath(this.path))
            .then(url => {
                this.overlayUrl = url;
            });
    }

    private updateBackgroundImages() {
        let urls = [];
        if (this._overlayUrl){
            urls.push(`url(${this._overlayUrl})`);
        }
        if (this._imageUrl){
            urls.push(`url(${this._imageUrl})`);
        }
        this._element.style.backgroundImage = urls.join(",");
    }
}