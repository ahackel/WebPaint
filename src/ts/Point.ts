export default class Point {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    copy(): Point{
        return new Point(this.x, this.y);
    }

    static add(a: Point, b: Point){
        return new Point(a.x + b.x, a.y + b.y);
    }

    static distance(a: Point, b: Point) {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}