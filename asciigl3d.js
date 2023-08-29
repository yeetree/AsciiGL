//AsciiGL3D Class
class AsciiGL3D {
    agl = null; //Reference to AsciiGL Context

    pMatrix = null; //Perspective Matrix
    rotzMatrix = null; //Z Rotation Matrix
    rotxMatrix = null; //X Rotation Matrix

    rotval = 50; //Rotation Axis

    fNear = 0.1; //Near Field
    fFar = 1000.0; //Far Field
    fFov = 90.0; //FOV
    fAspectRatio = 0; //Aspect Ratio (calculated on creation)
    fFovRad = 0; //FOV in Radians (calculated on creation)

    camera = new Camera();

    constructor(ctx) {
        this.agl = ctx; //Sets AsciiGL Context
        this.agl.doautoupdate = false; //Disables Auto Update
        this.agl.setblack();
        this.fAspectRatio = this.agl.height / this.agl.width; //Calculates Aspect Ratio

        this.fFovRad = Math.tan(this.fFov * 0.5 / 100.0 * 3.14159); //FOV in Radians

        //Perspective Matrix
        this.pMatrix = new Matrix4x4();
        this.pMatrix.m[0][0] = this.fAspectRatio * this.fFovRad;
        this.pMatrix.m[1][1] = this.fFovRad;
        this.pMatrix.m[2][2] = this.fFar / (this.fFar - this.fNear);
        this.pMatrix.m[3][2] = (-this.fFar * this.fNear) / (this.fFar - this.fNear);
        this.pMatrix.m[3][3] = 0;
        this.pMatrix.m[2][3] = 1;

        this.calcrmatrixes();
    }

    calcrmatrixes = function() {
            //Rotation Z Matrix
            this.rotzMatrix = new Matrix4x4();
            this.rotzMatrix.m[0][0] = Math.cos(this.rotval);
            this.rotzMatrix.m[0][1] = Math.sin(this.rotval);
            this.rotzMatrix.m[1][0] = -Math.sin(this.rotval)
            this.rotzMatrix.m[1][1] = Math.cos(this.rotval);
            this.rotzMatrix.m[2][2] = 1;
            this.rotzMatrix.m[3][3] = 1;
    
            //Rotation X Matrix
            this.rotxMatrix = new Matrix4x4();
            this.rotxMatrix.m[0][0] = 1;
            this.rotxMatrix.m[1][1] = Math.cos(this.rotval * 0.5);
            this.rotxMatrix.m[1][2] = Math.sin(this.rotval * 0.5);
            this.rotxMatrix.m[2][1] = -Math.sin(this.rotval * 0.5);
            this.rotxMatrix.m[2][2] = Math.cos(this.rotval * 0.5);
            this.rotxMatrix.m[3][3] = 1;
    }

    //Drawing Mesh Code
    drawmesh = function(mesh) {
        this.calcrmatrixes();

        let tristorender = [];

        for(let i=0; i<mesh.tris.length; i++) {
            const tri = mesh.tris[i].clone();

            let offx = 3.2;
            let offy = 3.1;
            let scale = 0.15;

            let triRotZ = tri.clone();  //Clones triangle (Because JavaScript is stupid)

            triRotZ.p[0] = this.multiplyMatrixVector(tri.p[0], triRotZ.p[0], this.rotzMatrix); //Multiply by Z Matrix
            triRotZ.p[1] = this.multiplyMatrixVector(tri.p[1], triRotZ.p[1], this.rotzMatrix);
            triRotZ.p[2] = this.multiplyMatrixVector(tri.p[2], triRotZ.p[2], this.rotzMatrix);

            let triRotZX = triRotZ.clone(); //Clones triangle (Because JavaScript is stupid)

            triRotZX.p[0] = this.multiplyMatrixVector(triRotZ.p[0], triRotZX.p[0], this.rotxMatrix); //Multiply by X Matrix
            triRotZX.p[1] = this.multiplyMatrixVector(triRotZ.p[1], triRotZX.p[1], this.rotxMatrix);
            triRotZX.p[2] = this.multiplyMatrixVector(triRotZ.p[2], triRotZX.p[2], this.rotxMatrix);

            let triTrans = triRotZX.clone(); //Clones triangle (Because JavaScript is stupid)

            triTrans.p[0].z = triRotZX.p[0].z + 10; //Offsets Z by 3
            triTrans.p[1].z = triRotZX.p[1].z + 10;
            triTrans.p[2].z = triRotZX.p[2].z + 10;

            //Calculate Normals
            let tt = triTrans.clone();
            let normal = new Vector3();
            let line1 = new Vector3();
            let line2 = new Vector3();
            line1.x = tt.p[1].x - tt.p[0].x;
            line1.y = tt.p[1].y - tt.p[0].y;
            line1.z = tt.p[1].z - tt.p[0].z;

            line2.x = tt.p[2].x - tt.p[0].x;
            line2.y = tt.p[2].y - tt.p[0].y;
            line2.z = tt.p[2].z - tt.p[0].z;

            normal.x = line1.y * line2.z - line1.z * line2.y;
            normal.y = line1.z * line2.x - line1.x * line2.z;
            normal.z = line1.x * line2.y - line1.y * line2.x;

            let l = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
            normal.x /= l; normal.y /= l; normal.z /= l;

            //if(normal.z < 0) {
            if(normal.x * (tt.p[0].x - this.camera.pos.x) + 
               normal.y * (tt.p[0].y - this.camera.pos.y) + 
               normal.z * (tt.p[0].z - this.camera.pos.z) < 0) {
                //3D -> 2D

                let lightdir = new Vector3(0, 0, -1);
                let l = Math.sqrt(lightdir.x * lightdir.x + lightdir.y * lightdir.y + lightdir.z * lightdir.z);
                lightdir.x /= l; lightdir.y /= l; lightdir.z /= l;

                let dp = normal.x * lightdir.x + normal.y * lightdir.y + normal.z * lightdir.z;
                
                let col = this.valtoascii(dp);

                //let col = this.valtoascii(Math.sin(this.rotval));

                let triProj = new Triangle();
                triProj.p[0] = this.multiplyMatrixVector(triTrans.p[0], triProj.p[0], this.pMatrix) //Multiplies triangle by perspective matrix
                triProj.p[1] = this.multiplyMatrixVector(triTrans.p[1], triProj.p[1], this.pMatrix)
                triProj.p[2] = this.multiplyMatrixVector(triTrans.p[2], triProj.p[2], this.pMatrix)

                triProj.p[0].x += offx; triProj.p[0].y += offy; //More offsets
                triProj.p[1].x += offx; triProj.p[1].y += offy; 
                triProj.p[2].x += offx; triProj.p[2].y += offy; 

                triProj.p[0].x *= scale * this.agl.width; triProj.p[0].y *= scale * this.agl.height; //Scales
                triProj.p[1].x *= scale * this.agl.width; triProj.p[1].y *= scale * this.agl.height;
                triProj.p[2].x *= scale * this.agl.width; triProj.p[2].y *= scale * this.agl.height;

                triProj.col = col;
                tristorender.push(triProj);
                //this.drawtri(triProj, col,  col) //Draw
            }

            tristorender = tristorender.sort((a, b) => {
                let z1 = (a.p[0].z + a.p[1].z + a.p[2].z) / 3;
                let z2 = (b.p[0].z + b.p[1].z + b.p[2].z) / 3;

                if(z1 < z2) { return 1 }
                return -1;
            })
            
            for(let i = 0; i<tristorender.length; i++) {
                let col = tristorender[i].col;
                this.drawtri(tristorender[i], col,  col) //Draw
            }
        }
    }

    valtoascii = function(val) {
        val = parseInt(12*val);
        let col = 0;
        switch(val) {
            case 11: col = 64; break;
            case 10: col = 64; break;
            case 9: col = 48; break;
            case 8: col = 48; break;
            case 7: col = 35; break;
            case 6: col = 35; break;
            case 5: col = 73; break;
            case 4: col = 73; break;
            case 3: col = 43; break;
            case 2: col = 43; break;
            case 1: col = 126; break;
            case 0: col = 126; break;
            default: col = 126; break;
        }
        return col;
    }

    invvaltoascii = function(val) {
        val = parseInt(12*val);
        let col = 0;
        switch(val) {
            case 0: col = 64; break;
            case 1: col = 64; break;
            case 2: col = 48; break;
            case 3: col = 48; break;
            case 4: col = 35; break;
            case 5: col = 35; break;
            case 6: col = 73; break;
            case 7: col = 73; break;
            case 8: col = 43; break;
            case 9: col = 43; break;
            case 10: col = 126; break;
            case 11: col = 126; break;
            default: col = 64; break;
        }
        return col;
    }

    drawtri = function(tri, o, f) {
        //Gets points of the triangle
        let y1 = tri.p[0].y;
        let y2 = tri.p[1].y;
        let y3 = tri.p[2].y;

        let x1 = tri.p[0].x;
        let x2 = tri.p[1].x;
        let x3 = tri.p[2].x;

        //Sort verts

        let verts = [[x1, y1], [x2, y2], [x3, y3]];
        verts = verts.sort((a, b) => {
            if(b[1] < a[1]) { return 1 }
            return -1
        })

        x1 = verts[0][0]; y1 = verts[0][1];
        x2 = verts[1][0]; y2 = verts[1][1];
        x3 = verts[2][0]; y3 = verts[2][1];

        //Fill Triangle -- Needs redone, glitchy
        let dx1 = x3 - x1;
        let dx2 = x2 - x1;
        let dx3 = x3 - x2;
        let dy1 = y3 - y1;
        let dy2 = y2 - y1;
        let dy3 = y3 - y2;
        // line slopes
        let k1 = dy1 / dx1;
        let k2 = dy2 / dx2;
        let k3 = dy3 / dx3;
        // draw line by line from top to bottom
        this.agl.primitives.stroke = f;
        for(let y=y1; y<y3; y++){
            let lx1 = (y - y1) / k1 + x1;
            let lx2;
            // determine if lower or upper half
            if(y < y2){
                lx2 = (y - y1) / k2 + x1;
            }else{
                lx2 = (y - y2) / k3 + x2;
            }
            this.agl.primitives.line(lx1, y, lx2, y);
        }

        //Draw outline
        this.agl.primitives.stroke = o;
        this.agl.primitives.line(x1, y1, x2, y2);
        this.agl.primitives.line(x2, y2, x3, y3);
        this.agl.primitives.line(x3, y3, x1, y1);
    }

    multiplyMatrixVector(i, o, m) {
        //Multiplies triangles by perspective matrix
       o.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + m.m[3][0]; 
       o.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + m.m[3][1];
       o.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + m.m[3][2];
       let w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + m.m[3][3];

       if(w != 0) {
         o.x /= w;
         o.y /= w;
         o.z /= w;
       }

       return o;
    }

    clear = function() {
        this.agl.clear();
    }

    update = function() {
        this.agl.update();
    }

}

class Camera {
    pos = new Vector3(0, 0, 0);
}

class Vector3 {

    x = 0;
    y = 0;
    z = 0;

    constructor(x=0, y=0, z=0) {
        this.x=x;
        this.y=y;
        this.z=z;
    }

    clone = function() {
        return new Vector3(this.x, this.y, this.z); //Neat function to clone this class to make clone instance
    }
}

class Triangle {
    p = Array(3);

    constructor(p1=new Vector3(0, 0, 0), p2=new Vector3(0, 0, 0), p3=new Vector3(0, 0, 0)) {
        this.p[0] = p1.clone(); //Clones the Vectors (Because JavaScript is stupid)
        this.p[1] = p2.clone();
        this.p[2] = p3.clone();
    }

    clone = function() {
        let cl = new Triangle(this.p[0].clone(), this.p[1].clone(), this.p[2].clone()) //Neat function to clone this class to make clone instance
        return cl;
    }
}

class Mesh {
    tris = [];

    loadurl = async function(file) {
        let res = await fetch(file);
        let txt = await res.text();
        await this.loadstr(txt);
    }

    loadstr = function(str) {
        let lines = str.split('\n');
        let verts = [];
        for(let i = 0; i < lines.length; i++) {
            if(lines[i][0] == "v") {
                let v = new Vector3();
                let line = lines[i].split(' ');
                if(line.length > 3) {
                    v.x = parseFloat(line[1]);
                    v.y = parseFloat(line[2]);
                    v.z = parseFloat(line[3]);
                    verts.push(v);
                }

            }
            else if(lines[i][0] == "f") {
                let t = new Triangle();
                let line = lines[i].split(' ');
                if(line.length > 3) {
                    t.p[0] = verts[parseInt(line[1]) - 1];
                    t.p[1] = verts[parseInt(line[2]) - 1];
                    t.p[2] = verts[parseInt(line[3]) - 1];
                    this.tris.push(t);
                }
            }
        }
    }

    loadb64 = function(b64) {
        let pstr = atob(b64);
        this.loadstr(pstr);
    }
}

class Matrix4x4 {
    m = Array(4);
    constructor() {
        this.m[0] = Array(4).fill(0);
        this.m[1] = Array(4).fill(0);
        this.m[2] = Array(4).fill(0);
        this.m[3] = Array(4).fill(0);
    }
}