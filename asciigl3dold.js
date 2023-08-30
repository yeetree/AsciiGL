//AsciiGL3D Class
class AsciiGL3D {
    agl = null; //Reference to AsciiGL Context

    pMatrix = null; //Perspective Matrix
    
    rotval = 50; //Rotation Axis

    fNear = 0.1; //Near Field
    fFar = 1000.0; //Far Field
    fFov = 90.0; //FOV
    fAspectRatio = 0; //Aspect Ratio (calculated on creation)

    rotzMatrix = null;
    rotyMatrix= null;
    rotxMatrix = null;


    camera = new Camera();

    constructor(ctx) {
        this.agl = ctx; //Sets AsciiGL Context
        this.agl.doautoupdate = false; //Disables Auto Update
        this.agl.setblack();
        this.fAspectRatio = this.agl.height / this.agl.width; //Calculates Aspect Ratio

        this.pMatrix = this.matrixMakeProjection(this.fFov, this.fAspectRatio, this.fNear, this.fFar);
    }

    //Drawing Mesh Code
    drawmesh = function(mesh) {

        this.rotxMatrix = this.matrixMakeX(this.rotval)
        this.rotyMatrix = this.matrixMakeY(this.rotval)
        this.rotzMatrix = this.matrixMakeZ(this.rotval * 0.5)

        let mattrans = new Matrix4x4();
        mattrans = this.matrixMakeTranlation(0, 0, 5);

        let matworld = new Matrix4x4();
        matworld = this.matrixMakeIdentity();
        matworld = this.matrixMultiplyMatrix(this.rotzMatrix, this.rotxMatrix);
        //matworld = this.matrixMultiplyMatrix(matworld, this.rotyMatrix);
        matworld = this.matrixMultiplyMatrix(matworld, mattrans);

        let tristorender = [];

        for(let i=0; i<mesh.tris.length; i++) {
            const tri = mesh.tris[i].clone();

            let offx = 3.2;
            let offy = 3.1;
            let scale = 0.15;

            let triTrans = new Triangle();

            triTrans.p[0] = this.matrixMultiplyVec(matworld, tri.p[0]);
            triTrans.p[1] = this.matrixMultiplyVec(matworld, tri.p[1]);
            triTrans.p[2] = this.matrixMultiplyVec(matworld, tri.p[2]);

            //Calculate Normals
            let tt = triTrans.clone();
            let normal = new Vector3();
            let line1 = new Vector3();
            let line2 = new Vector3();

            line1 = this.subVec(tt.p[1], tt.p[0]);
            line2 = this.subVec(tt.p[2], tt.p[0]);

            normal = this.crossProdVec(line1, line2);

            normal = this.normVec(normal);

            let vCamRay = this.subVec(tt.p[0], this.camera.pos)

            //if(normal.z < 0) {
            if(this.dotProdVec(normal, vCamRay) < 0) {
                //3D -> 2D

                let lightdir = new Vector3(0, 1, -1);
                lightdir = this.normVec(lightdir);

                let dp = Math.max(0.1, this.dotProdVec(lightdir, normal))
                
                let col = this.valtoascii(dp);

                //let col = this.valtoascii(Math.sin(this.rotval));

                let triProj = new Triangle();
                triProj.p[0] = this.matrixMultiplyVec(this.pMatrix, triTrans.p[0]) //Multiplies triangle by perspective matrix
                triProj.p[1] = this.matrixMultiplyVec(this.pMatrix, triTrans.p[1])
                triProj.p[2] = this.matrixMultiplyVec(this.pMatrix, triTrans.p[2])

                triProj.p[0] = this.divVec(triProj[0], triProj[0].w);
                triProj.p[1] = this.divVec(triProj[1], triProj[1].w);
                triProj.p[2] = this.divVec(triProj[2], triProj[2].w);

                let offset = new Vector3(0, 0, 0)
                triProj[0] = this.addVec(triProj.p[0], offset);
                triProj[1] = this.addVec(triProj.p[1], offset);
                triProj[2] = this.addVec(triProj.p[2], offset);

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
            case 10: col = 77; break;
            case 9: col = 48; break;
            case 8: col = 35; break;
            case 7: col = 105; break;
            case 6: col = 43; break;
            case 5: col = 33; break;
            case 4: col = 39; break;
            case 3: col = 126; break;
            case 2: col = 45; break;
            case 1: col = 46; break;
            case 0: col = 96; break;
            default: col = 64; break;
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

    matrixMakeIdentity = function() {
        let m = new Matrix4x4();
        m.m[0][0] = 1;
        m.m[1][1] = 1;
        m.m[2][2] = 1;
        m.m[3][3] = 1;
        return m;
    }

    matrixMakeZ = function(x) {
        //Rotation Z Matrix
        let m = new Matrix4x4();
        m.m[0][0] = Math.cos(x);
        m.m[0][1] = Math.sin(x);
        m.m[1][0] = -Math.sin(x)
        m.m[1][1] = Math.cos(x);
        m.m[2][2] = 1;
        m.m[3][3] = 1;
        return m;
    }

    matrixMakeX = function(x) {
        //Rotation X Matrix
        let m = new Matrix4x4();
        m.m[0][0] = 1;
        m.m[1][1] = Math.cos(x);
        m.m[1][2] = Math.sin(x);
        m.m[2][1] = -Math.sin(x);
        m.m[2][2] = Math.cos(x);
        m.m[3][3] = 1;
        return m;
    }

    matrixMakeY = function(x) {
        //Rotation Y Matrix
        let m = new Matrix4x4();
        m.m[0][0] = Math.cos(x);
        m.m[0][2] = Math.sin(x);
        m.m[2][0] = -Math.sin(x);
        m.m[1][1] = 1;
        m.m[2][2] = Math.cos(x);
        m.m[3][3] = 1;
        return m;
    }

    matrixMakeTranlation(x, y, z) {
        let m = new Matrix4x4();
        m.m[0][0] = 1;
        m.m[1][1] = 1;
        m.m[2][2] = 1;
        m.m[3][3] = 1;
        m.m[3][0] = x;
        m.m[3][1] = y;
        m.m[3][2] = z;
        return m;
    }

    matrixMakeProjection = function(fFov, fAspectRatio, fNear, fFar) {
        let fFovRad = Math.tan(fFov * 0.5 / 100.0 * 3.14159); //FOV in Radians

        //Perspective Matrix
        let pMatrix = new Matrix4x4();
        pMatrix.m[0][0] = fAspectRatio * fFovRad;
        pMatrix.m[1][1] = fFovRad;
        pMatrix.m[2][2] = fFar / (fFar - fNear);
        pMatrix.m[3][2] = (-fFar * fNear) / (fFar - fNear);
        pMatrix.m[3][3] = 0;
        pMatrix.m[2][3] = 1;
        return pMatrix;
    }

    matrixMultiplyVec = function(m, i) {
        let v = new Vector3();
        v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * [3][0];
        v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * [3][1];
        v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * [3][2];
        v.x = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * [3][3];
        return v;
    }

    matrixMultiplyMatrix = function(m1, m2) {
        let m = new Matrix4x4();
        for(let c = 0; c < 4; c++) {
            for(let r = 0; r < 4; r++) {
                m.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c] + m1.m[r][2] * m2.m[2][c] + m1.m[r][3] * m2.m[3][c]
            }
        }
        return m;
    }

    addVec = function(v1, k) {
        v1.x += k;
        v1.y += k;
        v1.z += k;
        return v1;
    }

    subVec = function(v1, k) {
        v1.x -= k
        v1.y -= k;
        v1.z -= k;
        return v1;
    }

    mulVec = function(v1, k) {
        v1.x *= k;
        v1.y *= k;
        v1.z *= k;
        return v1;
    }

    divVec = function(v1, k) {
        v1.x /= k;
        v1.y /= k;
        v1.z /= k;
        return v1;
    }

    dotProdVec = function(v1, v2) {
        return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
    }

    crossProdVec = function(v1, v2) {
        let v = new Vector3();
        v.x = v1.y * v2.z - v1.z * v2.y;
        v.y = v1.z * v2.x - v1.x * v2.z;
        v.z = v1.x * v2.y - v1.y * v2.x;
        return v;
    }

    lengthVec = function(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }

    normVec = function(v) {
        let l = this.lengthVec(v);
        v.x /= l;
        v.y /= l;
        v.z /= l;
        return v;
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
    w = 1;

    constructor(x=0, y=0, z=0, w=1) {
        this.x=x;
        this.y=y;
        this.z=z;
        this.w=w;
    }

    clone = function() {
        return new Vector3(this.x, this.y, this.z, this.w); //Neat function to clone this class to make clone instance
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