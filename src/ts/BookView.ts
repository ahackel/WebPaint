import ImageStorage from "./ImageStorage";
import {config} from "./config";
import {View} from "./View";
import Utils from "./Utils";

export default class BookView extends View {

    public onImageSelected: Function | undefined;

    constructor(id: string) {
        super(id);
        this._element.addEventListener("imagesaved", event => {
            this.updateImages();
        })
    }

    show(): void {
        super.show();
        this.updateImages();
    }

    private updateImages() {
        for (let i: number = 0; i < config.PagesInBookCount; i++) {
            this.loadImage("image" + i);
        }
    }

    private addImage(id: string) {
        let element = <HTMLDivElement>document.createElement("div");
        element.id = id;
        element.classList.add("thumbnail");
        element.style.width = `${window.screen.width * 0.18}px`;
        element.style.height = `${window.screen.height * 0.18}px`;
        Utils.addFastClick(element, event => {
            event.preventDefault();
            if (this.onImageSelected) {
                this.onImageSelected(id);
            }
        });
        this._element.appendChild(element);
        this.loadImage(id);
    }

    private loadImage(id: string) {
        let thumbnail = document.getElementById(id);
        
        if (!thumbnail){
            this.addImage(id);
            return;
        }
        
        ImageStorage.loadImage(id)
            .then(img => {
                if (img) {
                    if (thumbnail.childElementCount > 0){
                        thumbnail.removeChild(thumbnail.firstChild);
                    }
                    img.draggable = false;
                    thumbnail.appendChild(img);
                }
            });
    }
}
