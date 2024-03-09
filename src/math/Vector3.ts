import { Matrix4 } from "./Matrix4";

class Vector3 {
    public readonly x: number;
    public readonly y: number;
    public readonly z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    equals(v: Vector3): boolean {
        if (this.x !== v.x) {
            return false;
        }
        if (this.y !== v.y) {
            return false;
        }
        if (this.z !== v.z) {
            return false;
        }

        return true;
    }

    add(v: number): Vector3;
    add(v: Vector3): Vector3;
    add(v: number | Vector3): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x + v, this.y + v, this.z + v);
        } else {
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
    }

    subtract(v: number): Vector3;
    subtract(v: Vector3): Vector3;
    subtract(v: number | Vector3): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x - v, this.y - v, this.z - v);
        } else {
            return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
    }

    multiply(v: number): Vector3;
    multiply(v: Vector3): Vector3;
    multiply(v: Matrix4): Vector3;
    multiply(v: number | Vector3 | Matrix4): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x * v, this.y * v, this.z * v);
        } else if (v instanceof Vector3) {
            return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
        } else {
            return new Vector3(
                this.x * v.buffer[0] + this.y * v.buffer[4] + this.z * v.buffer[8] + v.buffer[12],
                this.x * v.buffer[1] + this.y * v.buffer[5] + this.z * v.buffer[9] + v.buffer[13],
                this.x * v.buffer[2] + this.y * v.buffer[6] + this.z * v.buffer[10] + v.buffer[14],
            );
        }
    }

    divide(v: number): Vector3;
    divide(v: Vector3): Vector3;
    divide(v: number | Vector3): Vector3 {
        if (typeof v === "number") {
            return new Vector3(this.x / v, this.y / v, this.z / v);
        } else {
            return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
        }
    }

    cross(v: Vector3): Vector3 {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;

        return new Vector3(x, y, z);
    }

    dot(v: Vector3): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    lerp(v: Vector3, t: number): Vector3 {
        return new Vector3(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t, this.z + (v.z - this.z) * t);
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    distanceTo(v: Vector3): number {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2);
    }

    normalize(): Vector3 {
        const length = this.magnitude();

        return new Vector3(this.x / length, this.y / length, this.z / length);
    }

    flat(): number[] {
        return [this.x, this.y, this.z];
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    toString(): string {
        return `[${this.flat().join(", ")}]`;
    }

    static One(value: number = 1): Vector3 {
        return new Vector3(value, value, value);
    }
}

export { Vector3 };
