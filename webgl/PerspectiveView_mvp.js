var VSHADER_SOURCE=
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    // 'uniform mat4 u_ViewMatrix;\n'+
    // 'uniform mat4 u_ProjMatrix;\n'+
    // 'uniform mat4 u_ModelMatrix;\n'+
    'uniform mat4 u_mvpMatrix;\n'+
    'varying vec4 v_Color;\n'+
    'void main() {\n' +
    ' gl_Position = u_mvpMatrix*a_Position;\n' +
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
    var gl=getWebGLContext(canvas);
    if(!gl)
    {
        console.log('Failed to get the rendering context for webgl');
        return;
    }
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);//开启深度测试
    gl.clear(gl.DEPTH_BUFFER_BIT);//清空深度缓冲区

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
    var u_mvpMatrix=gl.getUniformLocation(gl.program,'u_mvpMatrix');
    if(!u_mvpMatrix){
        console.log('Failed to get uniform position of u_mvpMatrix.');
        return;
    }
    // var u_ViewMatrix=gl.getUniformLocation(gl.program,'u_ViewMatrix');
    // if(!u_ViewMatrix){
    //     console.log('Failed to get uniform position of u_ViewMatrix.');
    //     return;
    // }
    // var u_ProjMatrix=gl.getUniformLocation(gl.program,'u_ProjMatrix');
    // if(!u_ProjMatrix){
    //     console.log('Failed to get uniform position of u_ProjMatrix.');
    //     return;
    // }
    var modelMatrix=new Matrix4();
    var viewMatrix=new Matrix4();
    var projMatrix=new Matrix4();
    projMatrix.setPerspective(30,canvas.width/canvas.height,1.0,100.0)
    document.onkeydown=function (ev) {
        keydown(ev,gl,n,u_mvpMatrix,modelMatrix,viewMatrix,projMatrix);
    }

    //projMatrix.setOrtho(-1.0,1.0,-1.0,1.0,0.0,2.0);
    //gl.uniformMatrix4fv(u_ProjMatrix,false,projMatrix.elements);
    draw(gl,n,u_mvpMatrix,modelMatrix,viewMatrix,projMatrix);

}

function initVertexBuffers(gl) {
    var verticesColors=new Float32Array([
        //3个三角形
        0, 1.0,-4.0,0.4,1.0,0.4,//绿色三角形在最后面
        -0.5,-1.0,-4.0,0.4,1.0,0.4,
        0.5,-1.0,-4.0,1.0,0.4,0.4,

        // 0, 1.0,-2.0,1.0,1.0,0.4,//黄色三角形在中间
        // -0.5,-1.0,-2.0,1.0,1.0,0.4,
        // 0.5,-1.0,-2.0,1.0,0.4,0.4,

        0, 1.0,-2.0,1.0,1.0,0.4,//黄色三角形在中间
        -0.5,-1.0,-2.0,1.0,1.0,0.4,
        0.5,-1.0,-2.0,1.0,1.0,0.4,

        // 0, 1.0,0.0,0.4,0.4,1.0,//蓝色三角形在最前面
        // -0.5,-1.0,0.0,0.4,0.4,1.0,
        // 0.5,-1.0,0.0,1.0,0.4,0.4

        //为了测试深度冲突，顶点需要跟产生冲突的另一个三角形略微不一样，这样系统不知道绘制哪个时由于两个三角形同一个像素位置的颜色不一样会看出效果，所以颜色设置不一样的纯色或渐变是对于看出效果必要的
        0, 0.5,-2.0,0.4,0.4,1.0,//蓝色三角形在最前面
        -0.5,-0.5,-2.0,0.4,0.4,1.0,
        0.5,-0.5,-2.0,1.0,0.4,0.4

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

var g_eyeX=0.0,g_eyeY=0.0,g_eyeZ=5.0;
g_eyeX=-0.75;//为了测试深度冲突现象，但是并没有出现
function keydown(ev,gl,n,u_mvpMatrix,modelMatrix,viewMatrix,projMatrix) {
    if(ev.keyCode==39){
        g_eyeX+=0.01;
    }
    else if(ev.keyCode==37){
        g_eyeX-=0.01;
    }
    else{
        return;
    }
    draw(gl,n,u_mvpMatrix,modelMatrix,viewMatrix,projMatrix);
}

function draw(gl,n,u_mvpMatrix,modelMatrix,viewMatrix,projMatrix) {
    modelMatrix.setTranslate(-0.75,0,0);
    //gl.uniformMatrix4fv(u_ModelMatrix,false,modelMatrix.elements);
    viewMatrix.setLookAt(g_eyeX,g_eyeY,g_eyeZ,0,0,-100,0,1,0);
    var mvpMatrix=new Matrix4();
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    //mvpMatrix.set(modelMatrix).multiply(viewMatrix).multiply(projMatrix);
    gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,n);
    modelMatrix.setTranslate(0.75,0,0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    //mvpMatrix.set(modelMatrix).multiply(viewMatrix).multiply(projMatrix);
    gl.uniformMatrix4fv(u_mvpMatrix,false,mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,0,n);
}



