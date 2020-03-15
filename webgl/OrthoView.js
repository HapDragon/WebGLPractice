var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    'uniform mat4 u_ProjMatrix;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
    ' gl_Position = u_ProjMatrix*a_Position;\n' +
    ' v_Color = a_Color;\n' +
    '}\n';
var FSHADER_SOURCE=
    'precision mediump float;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
    ' gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
    var canvas=document.getElementById('webgl');
    var nf=document.getElementById('nearFar');
    var gl=getWebGLContext(canvas);
    if(!gl)
    {
        console.log('Failed to get the rendering context for webgl');
        return;
    }
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log('Failed to initialize shader.');
        return;
    }
    //设置顶点坐标和颜色
    var n=initVertexBuffers(gl);
    if(n<0)
    {
        console.log("Failed to set the positions of the vertices");
        return;
    }

    var u_ProjMatrix=gl.getUniformLocation(gl.program,'u_ProjMatrix');
    if(!u_ProjMatrix){
        console.log('Failed to get uniform position of u_ProjMatrix.');
        return;
    }
    var projMatrix=new Matrix4();
    document.onkeydown=function (ev) {
        keydown(ev,gl,n,u_ProjMatrix,projMatrix,nf);
    }
    draw(gl,n,u_ProjMatrix,projMatrix,nf);
}

function initVertexBuffers(gl) {

    var verticesColors=new Float32Array([
        0.0, 0.8,-0.6,0.0,1.0,0.0,//最后的三角形为绿色
        -0.8,-0.8,-0.6,0.0,1.0,0.0,
        0.8,-0.8,-0.6,0.0,1.0,0.0,

        0.5, 0.4,-0.4,1.0,0.0,0.0,//中间三角形为红色
        -0.5, 0.4,-0.4,1.0,0.0,0.0,
        0.0,-0.5,-0.4,1.0,0.0,0.0,

        0.0, 0.3,-0.2,1.0,1.0,1.0,//前面三角形为蓝色
        -0.3,-0.3,-0.2,1.0,1.0,1.0,
        0.3,-0.3,-0.2,1.0,1.0,1.0
    ]);
    var fsize=verticesColors.BYTES_PER_ELEMENT;
    var n=9;
    //创建缓冲区对象
    var vertexTexCoordBuffer=gl.createBuffer();
    if(!vertexTexCoordBuffer){
        console.log('Failed to create the buffer object ');
        return -1;
    }
    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTexCoordBuffer);
    //向缓冲区对象写入数据
    //gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER,verticesColors,gl.STATIC_DRAW);
    var a_Position=gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position<0){
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,fsize*6,0);
    //开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    var a_Color=gl.getAttribLocation(gl.program,'a_Color');
    if(a_Color<0){
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Color,2,gl.FLOAT,false,fsize*6,fsize*3);
    //开启attribute变量：连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Color);

    return n;
}

var g_near=0.0,g_far=0.5;
function keydown(ev,gl,n,u_ProjMatrix,projMatrix,nf) {
    switch (ev.keyCode) {
        case 39:g_near+=0.01;break;//右方向键
        case 37:g_near-=0.01;break;//左方向键
        case 38:g_far+=0.01;break;//上方向键
        case 40:g_far-=0.01;break;//下方向键
        default:return;
    }
    draw(gl,n,u_ProjMatrix,projMatrix,nf);
}
function draw(gl,n,u_ProjMatrix,projMatrix,nf) {
    projMatrix.setOrtho(-1.0,1.0,-1.0,1.0,g_near,g_far);
    gl.uniformMatrix4fv(u_ProjMatrix,false,projMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    nf.innerHTML="near:"+Math.round(g_near*100)/100+',far:'+Math.round(g_far*100)/100;
    gl.drawArrays(gl.TRIANGLES,0,n);
}



